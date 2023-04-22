import json
import random
import re
from functools import wraps

from flask import request, session
from flask_redis import Redis
from flask_socketio import SocketIO, join_room
from werkzeug.security import check_password_hash, generate_password_hash

from app.__init__ import create_app
from app.db import get_db

app = create_app()
socket = SocketIO(app, cors_allowed_origins="*")
redis_client = Redis()
redis_client.init_app(app)

# Regex patterns for username, email, and password validation
USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"


@app.before_first_request
def clear_redis():
    redis_client.flushdb()


# Decorator requires user authentication
def login_required(method_name):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if 'user_id' not in session:
                socket.emit(method_name, {
                    "success": False,
                    "error_code": 401,
                    "error_message": "User is not authorized.",
                    "data": {},
                }, room=request.sid)
                return
            return func(*args, **kwargs)

        return wrapper

    return decorator


# Decorator requires admin privileges
def admin_required():
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if 'user_status' not in session or session["user_status"] != "adm":
                return
            return func(*args, **kwargs)

        return wrapper

    return decorator


# Decorator requires user to be available for game
def not_in_another_game(method_name):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # TODO - comment out for debug purposes
            if "has_game_ongoing" in session and session.get("has_game_ongoing"):
                # TODO is it the best idea to just send message?
                socket.emit(method_name, {
                    "success": False,
                    "error_code": 400,
                    "error_message": "You are already in a game.",
                    "data": {},
                }, room=request.sid)
                return
            return func(*args, **kwargs)

        return wrapper

    return decorator


@socket.on('connect')
def connect():
    return


@socket.on('disconnect')
def disconnect():
    # Remove user from wait room
    redis_client.lrem("wait-list", 0, json.dumps({"user_id": session.get("user_id")}))

    # Clear session
    session.clear()

    # Remove user from ongoing games
    # TODO Remove disconnected users from any ongoing games


@socket.on('register')
def register(data):
    # Fetch event data
    username = data["username"]
    email = data["email"]
    password = data["password"]
    db = get_db()

    # Validate username
    if not re.match(USERNAME_PATTERN, username):
        socket.emit('register', {
            "success": False,
            "error_code": 422,
            "error_message": "Username is invalid.",
            "data": {},
        }, room=request.sid)
        return

    # Validate email
    if not re.match(EMAIL_PATTERN, email):
        socket.emit('register', {
            "success": False,
            "error_code": 422,
            "error_message": "Email is invalid.",
            "data": {},
        }, room=request.sid)
        return

    # Validate password
    if not re.match(PASSWORD_PATTERN, password):
        socket.emit('register', {
            "success": False,
            "error_code": 422,
            "error_message": "Password must contain at least 8 characters, one uppercase letter, one lowercase "
                             "letter, and one number. ",
            "data": {},
        }, room=request.sid)
        return

    try:
        # TODO user status must NOT be adm when deployed
        db.execute(
            "INSERT INTO user (username, email, password, user_status) VALUES (?, ?, ?, ?)",
            (username, email, generate_password_hash(password), "adm"),
        )
        db.commit()
    except db.IntegrityError:
        socket.emit('register', {
            "success": False,
            "error_code": 409,
            "error_message": "Username or email is/are already in-use.",
            "data": {},
        }, room=request.sid)
        return
    else:
        socket.emit('register', {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {},
        }, room=request.sid)
        print(f"Client registered: {username}")
    return


@socket.on('login')
def login(data):
    # Fetch event data
    username = data["username"]
    password = data["password"]

    # Retrieve user from database
    db = get_db()
    user = db.execute(
        "SELECT * FROM user WHERE username = ?", (username,)
    ).fetchone()

    # Check if user doesn't exist
    if user is None or not check_password_hash(user["password"], password):
        socket.emit('login', {
            "success": False,
            "error_code": 401,
            "error_message": "Incorrect username or password.",
            "data": {},
        }, room=request.sid)
        return

    # Clear session and add user
    session.clear()
    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["email"] = user["email"]
    session["user_status"] = user["user_status"]

    # Return 200 & user data
    socket.emit('login', {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "user_id": session["user_id"],
            "username": session["username"],
            "email": session["email"],
        },
    }, room=request.sid)
    print(f"Client logged in: {username}")
    return


@socket.on('logout')
@login_required(method_name="logout")
def logout():
    # Clear session
    session.clear()

    # Return 200
    socket.emit('logout', {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {},
    }, room=request.sid)
    print(f"Client logged out: successfully")
    return


@socket.on('session')
@login_required(method_name="session")
def session_info():
    # Return 200 & session data
    socket.emit('session', {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "user_id": session.get("user_id"),
            "username": session.get("username"),
            "email": session.get("email"),
        }}, room=request.sid)
    print(f"Client requested session info: {session.get('username')}")
    return


@socket.on('join-wait')
@login_required(method_name="join-wait")
# TODO - @not_in_another_game(method_name="join-wait")
def join_wait():
    """
    Pair 2 players for game and send out generic game data
    :return: nothing
    """

    # Check if the user is already in Redis
    wait_list = redis_client.lrange("wait-list", 0, -1)
    for user in wait_list:
        if json.loads(user)["user_id"] == session.get("user_id"):
            return

    # Add user data to redis db
    redis_client.rpush("wait-list", json.dumps({
        "user_id": session.get("user_id"),
        "username": session.get("username"),
        "request_id": request.sid
    }))

    # Check if wait list has less than two users
    if redis_client.llen("wait-list") < 2:
        return

    # Pick two players for game
    player1 = json.loads(redis_client.lpop("wait-list"))
    player2 = json.loads(redis_client.lpop("wait-list"))

    # Randomly choose which player goes first
    first_move_player_number = random.randint(1, 2)
    first_move_player_id = player1["user_id"] if first_move_player_number == 1 else player2["user_id"]

    # Randomly assign marker to both players
    player1_marker, player2_marker = random.sample(["x", "o"], k=2)

    # Create game and game board
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO game (game_mode, player_1, player_2, player_1_marker, player_2_marker) VALUES (?, ?, ?, ?, ?)",
        ('online', player1["user_id"], player2["user_id"], player1_marker, player2_marker),
    )
    game_id = cursor.lastrowid
    cursor.execute(
        "INSERT INTO game_board (game_id, next_move_by) VALUES (?, ?)",
        (game_id, first_move_player_id),
    )
    db.commit()

    # Add both users to socket room
    room_id = 'game-' + str(game_id)
    join_room(room_id, sid=player1['request_id'])
    join_room(room_id, sid=player2['request_id'])

    # Response for player 1
    socket.emit("join-wait", {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "game": {
                "game_id": game_id,
                "game_room_id": room_id,
                "game_players": [player1["user_id"], player2["user_id"]],
            },
        }}, room=player1["request_id"])

    # Response for player 2
    socket.emit("join-wait", {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "game": {
                "game_id": game_id,
                "game_room_id": room_id,
                "game_players": [player1["user_id"], player2["user_id"]],
            },
        }}, room=player2["request_id"])

    print(f"Game #{game_id} started between player #{player1['user_id']} and player #{player2['user_id']}")
    return


@socket.on('join-game')
@login_required(method_name="join-game")
# TODO - @not_in_another_game(method_name="join-wait")
def join_game(data):
    """
    Init game and send response with game, player, and opponent specific data.
    :return: nothing
    """
    # Store response data
    game_id = data["game_id"]

    # Retrieve needed session data
    user_id = session.get("user_id")

    # Retrieve game data from db
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT game.*, game_board.next_move_by FROM game JOIN game_board ON game.id = game_board.game_id "
                   "WHERE game.id = ?", (game_id,))
    game_data = cursor.fetchone()

    # Check if user is part of this game
    if game_data is None or (game_data["player_1"] != user_id and game_data["player_2"] != user_id):
        socket.emit("join-game", {
            "success": False,
            "error_code": 400,
            "error_message": "You are not part of this game.",
            "data": {},
        }, room=request.sid)
        return

    # Player & opponent data
    room_id = 'game-' + str(game_id)
    player_number = 1 if game_data["player_1"] == user_id else 2
    player_turn = user_id == game_data["next_move_by"]
    opponent_player_number = 2 if player_number == 1 else 1
    opponent_id = game_data["player_2"] if player_number == 1 else game_data["player_1"]

    # Retrieve opponent data
    cursor.execute("SELECT * FROM user WHERE id = ?", (opponent_id,))
    opponent_data = cursor.fetchone()
    opponent_username = opponent_data["username"]

    # Update session info w/ game data
    session["has_game_ongoing"] = True
    session["ongoing_game_id"] = game_id
    session["ongoing_game_room_id"] = room_id
    session["ongoing_game_player_number"] = player_number
    session["ongoing_game_player_turn"] = player_turn
    session["ongoing_game_opponent_id"] = opponent_id
    session["ongoing_game_opponent_username"] = opponent_username

    # Send event with game, player, and opponent data
    socket.emit("join-game", {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "game": {
                "game_id": game_id,
                "game_room_id": room_id,
            },
            "player": {
                "player_number": player_number,
                "player_turn": player_turn,
            },
            "opponent": {
                "opponent_id": opponent_id,
                "opponent_username": opponent_username,
                "opponent_player_number": opponent_player_number
            },
        }}, room=request.sid)
    return


@socket.on('make-move')
@login_required(method_name="make-move")
def make_move(response_data):
    # Check if user has an ongoing game
    if not session.get("has_game_ongoing"):
        return

    print("----------------has game")

    # Check if response data was provided
    if response_data is None:
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "No response data was provided.",
            "data": {},
        }, room=request.sid)
        return

    # Store response data
    move_coordinate = response_data["move_coordinate"]
    move_row = move_coordinate[0]
    move_col = move_coordinate[1]

    # Validate that provided data contains proper coordinate
    if move_coordinate is None or not isinstance(move_coordinate, list) or not len(
            move_coordinate) == 2 or not isinstance(move_coordinate[0], int) or not isinstance(move_coordinate[1], int):
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "Provided data does not contain proper coordinate",
            "data": {},
        }, room=request.sid)

    # Retrieve session data
    user_id = session.get("user_id")
    game_id = session.get("ongoing_game_id")
    room_id = session.get("ongoing_game_room_id")

    # TODO - what to do if either is null?

    # Retrieve game data from db
    db = get_db()
    cursor = db.cursor()
    select_game_data_query = "SELECT game.*, game_board.* FROM game JOIN game_board ON game.id = game_board.game_id " \
                             "WHERE game.id = ? "
    cursor.execute(select_game_data_query, (game_id,))
    game_data = cursor.fetchone()

    # Check if the player is part of this game
    if game_data is None or (game_data["player_1"] != user_id and game_data["player_2"] != user_id):
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "User is not part of this game.",
            "data": {},
        }, room=request.sid)
        return

    # Store game data
    next_move_by = game_data["next_move_by"]
    last_move_by = game_data["last_move_by"]
    player_number = 1 if game_data["player_1"] == user_id else 2
    player_marker = game_data[f"player_{player_number}_marker"]
    opponent_number = 2 if player_number == 1 else 1
    opponent_id = game_data[f"player_{opponent_number}"]

    print(f"""
        user id: {user_id},
        player number: {player_number},
        player marker: {player_marker},
        opponent number: {opponent_number},
        opponent id : {opponent_id},
    
    """)

    # Check if it's the player's turn to make a move
    if next_move_by != user_id:
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "Not user's turn to make a move.",
            "data": {},
        }, room=request.sid)
        return

    # Check if the player has already made a move
    if last_move_by == user_id:
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "You already made a move.",
            "data": {},
        }, room=request.sid)
        return

    # Check if the game is still ongoing
    if game_data["winner"] is not None:
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "The game has ended.",
            "data": {},
        }, room=request.sid)
        return

    # Check if the move coordinate is within the game board limits
    if not (0 <= move_row <= 2 and 0 <= move_col <= 2):
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "Invalid move.",
            "data": {},
        }, room=request.sid)
        return

    # Compose cell name
    cell_name = f"cell_{move_row}_{move_col}"

    # TODO - handle if cell is not in game data
    # if cell_name not in game_data:
    #     return

    # Check if the cell is already taken by another player
    if game_data[cell_name] != "":
        socket.emit("make-move", {
            "success": False,
            "error_code": 400,
            "error_message": "Cell is already taken.",
            "data": {},
        }, room=request.sid)
        return

    update_player_move_query = f"UPDATE game_board SET {cell_name} = ?, next_move_by = ?, last_move_by = ? WHERE game_id = ?"
    cursor.execute(update_player_move_query, (player_marker, opponent_id, user_id, game_id,))
    db.commit()

    socket.emit("move-made-successfully", {
        "success": True,
        "error_code": 200,
        "message": "Your move was made successfully.",
        "data": {}
    }, room=request.sid)

    # Emit event to the room with the move data
    socket.emit("make-move", {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "previous_move": {
                "player_id": user_id,
                "player_marker": player_marker,
                "move_coordinate": move_coordinate,
            },
            "next_move": {
                "player_id": opponent_id,
            },

        },
    }, room=room_id)


@socket.on("clear-redis-db")
@login_required(method_name="clear-radis-db")
@admin_required()
def clear_redis_db():
    redis_client.flushdb()
    print('Redis DB cleared.')


@socket.on("remove-all-groups")
@login_required(method_name="remove-all-groups")
@admin_required()
def remove_all_groups():
    socket.server.manager.disconnect_all()
    print('All SocketIO groups removed.')


if __name__ == '__main__':
    socket.run(app, debug=True, port=5001)
