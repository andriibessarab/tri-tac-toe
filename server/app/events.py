import json
import random
import re
import sqlite3

from flask import request
from flask_socketio import Namespace, emit, join_room
from werkzeug.security import generate_password_hash, check_password_hash

from .app_utils.session_keys import SessionKeys
from .app_utils.session_manager import Session
from .db import get_db

# Regex patterns for username, email, and password validation
USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"


class SockerEvents(Namespace):

    def on_connect(self):
        print("WERE IN BABY")
        """
        A SocketIO event handler for when a client connects to the server.
        """
        pass

    def on_disconnect(self):
        print("WERE OUT BABY")
        """
        A SocketIO event handler for when a client connects to the server.
        """
        pass

    def on_register(self, data):
        """
        A SocketIO event handler for when a client registers for an account.

        Args:
            data (dict): A dictionary containing the event data, including the username, email, and password.

        Returns:
            None
        """

        # Fetch event data
        username = data["username"]
        email = data["email"]
        password = data["password"]
        db = get_db()

        # Validate username
        if not re.match(USERNAME_PATTERN, username):
            emit("register", {
                "success": False,
                "error_code": 422,
                "error_message": "Username is invalid.",
                "data": {},
            }, room=request.sid)
            return

        # Validate email
        if not re.match(EMAIL_PATTERN, email):
            emit("register", {
                "success": False,
                "error_code": 422,
                "error_message": "Email is invalid.",
                "data": {},
            }, room=request.sid)
            return

        # Validate password
        if not re.match(PASSWORD_PATTERN, password):
            emit("register", {
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
            emit("register", {
                "success": False,
                "error_code": 409,
                "error_message": "Username or email is/are already in-use.",
                "data": {},
            }, room=request.sid)
            return
        else:
            emit("register", {
                "success": True,
                "error_code": 200,
                "error_message": "",
                "data": {},
            }, room=request.sid)
            print(f"Client registered: {username}")
        return

    def on_login(self, data):
        """
        Event handler for 'login' event. Authenticates the user by checking if the username and password match an entry
        in the database. If authentication succeeds, sets the session data and sends a success message to the client.

        Args:
            data (dict): The data sent with the event. Should contain keys 'username' and 'password' with string values.

        Returns:
            None.
            :param data:
            :param self:
        """

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
            emit("login", {
                "success": False,
                "error_code": 401,
                "error_message": "Incorrect username or password.",
                "data": {},
            }, room=request.sid)
            return

        user_id = user["id"]
        username = user["username"]
        user_email = user["email"]
        user_status = user["user_status"]

        # Clear session and add user
        Session.clear()
        Session.set(SessionKeys.USER_ID, user_id)
        Session.set(SessionKeys.USER_NAME, username)
        Session.set(SessionKeys.USER_EMAIL, user_email)
        Session.set(SessionKeys.USER_STATUS, user_status)

        # Return 200 & user data
        emit("login", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {
                "user_id": user_id,
                "username": username,
                "email": user_email,
            },
        }, room=request.sid)
        print(f"Client logged in: {username}")
        return

    def on_logout(self, data):
        """
        Event handler for 'logout' event. Clears the session and sends a success message to the client.

        Args:
            data (dict): The data sent with the event. Should be an empty dictionary.

        Returns:
            None.
            :param data:
            :param self:
        """

        # Clear session
        Session.clear()

        # Return 200
        emit("logout", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {},
        }, room=request.sid)
        print(f"Client logged out: successfully")
        return

    def on_session(self, data):
        # Return 200 & session data
        emit("session", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {
                "user_id": Session.get(SessionKeys.USER_ID),
                "username": Session.get(SessionKeys.USER_NAME),
                "email": Session.get(SessionKeys.USER_EMAIL),
            }}, room=request.sid)
        print(f"Client requested session info: {Session.get(SessionKeys.USER_NAME)}")
        return

    def on_join_wait(self, data):
        """
        Pair 2 players for game and send out generic game data
        :return: nothing
        """

        # Check if the user is already in Redis, and remove the old request
        wait_list = redis.lrange("wait-list", 0, -1)
        for user in wait_list:
            if json.loads(user)["user_id"] == Session.get(SessionKeys.USER_ID):
                redis.lrem("wait-list", 0, json.dumps({"user_id": Session.get(SessionKeys.USER_ID)}))

        # Add user data to redis db
        redis.rpush("wait-list", json.dumps({
            "user_id": Session.get(SessionKeys.USER_ID),
            "username": Session.get(SessionKeys.USER_NAME),
            "request_id": request.sid
        }))

        # Check if wait list has less than two users
        if redis.llen("wait-list") < 2:
            return

        # Pick two players for game
        player1 = json.loads(redis.lpop("wait-list"))
        player1_user_id = player1["user_id"]
        player1_request_id = player1["request_id"]
        player2 = json.loads(redis.lpop("wait-list"))
        player2_user_id = player2["user_id"]
        player2_request_id = player2["request_id"]

        # Randomly choose which player goes first
        first_move_player_number = random.randint(1, 2)
        first_move_player_id = player1_user_id if first_move_player_number == 1 else player2_user_id

        # Randomly assign marker to both players
        player1_marker, player2_marker = random.sample(["x", "o"], k=2)

        # Create game and game board
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                "INSERT INTO game (game_mode, player_1, player_2, player_1_marker, player_2_marker) VALUES (?, ?, ?, "
                "?, ?)",
                ('online', player1_user_id, player2_user_id, player1_marker, player2_marker),
            )
        except sqlite3.IntegrityError as e:
            if "CHECK constraint failed" in str(e):
                emit("join-wait", {
                    "success": True,
                    "error_code": 520,
                    "error_message": "Unknown server error occurred. Try to refresh the page!",
                    "data": {},
                }, room=player1_request_id)

                # Response for player 2
                emit("join-wait", {
                    "success": True,
                    "error_code": 520,
                    "error_message": "Unknown server error occurred. Try to refresh the page!",
                    "data": {},
                }, room=player2_request_id)

        # handle other IntegrityError cases here
        game_id = cursor.lastrowid
        cursor.execute(
            "INSERT INTO game_board (game_id, next_move_by) VALUES (?, ?)",
            (game_id, first_move_player_id),
        )
        db.commit()

        # Add both users to socket room
        room_id = 'game-' + str(game_id)

        try:
            join_room(room_id, sid=player1_request_id)
            join_room(room_id, sid=player2_request_id)
        except KeyError:  # If KeyError occurs return a 520 response
            emit("join-wait", {
                "success": True,
                "error_code": 520,
                "error_message": "Unknown server error occurred. Try to refresh the page!",
                "data": {},
            }, room=player1_request_id)

            # Response for player 2
            emit("join-wait", {
                "success": True,
                "error_code": 520,
                "error_message": "Unknown server error occurred. Try to refresh the page!",
                "data": {},
            }, room=player2_request_id)
            return

        # Response for player 1
        emit("join-wait", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {
                "game": {
                    "game_id": game_id,
                    "game_room_id": room_id,
                },
            }}, room=player1_request_id)

        # Response for player 2
        emit("join-wait", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {
                "game": {
                    "game_id": game_id,
                    "game_room_id": room_id,
                },
            }}, room=player2_request_id)

        print(f"Game #{game_id} started between player #{player1['user_id']} and player #{player2['user_id']}")

    def on_join_game(self, data):
        """
        Init game and send response with game, player, and opponent specific data.
        :return: nothing
        """
        # Store response data
        game_id = data["game_id"]

        # Retrieve needed session data
        user_id = Session.get(SessionKeys.USER_ID)

        # Retrieve game data from db
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "SELECT game.*, game_board.next_move_by FROM game JOIN game_board ON game.id = game_board.game_id "
            "WHERE game.id = ?", (game_id,))
        game_data = cursor.fetchone()

        # Check if user is part of this game
        if game_data is None or (game_data["player_1"] != user_id and game_data["player_2"] != user_id):
            emit("join-game", {
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
        player_marker = game_data[f"player_{player_number}_marker"]
        opponent_player_number = 2 if player_number == 1 else 1
        opponent_id = game_data["player_2"] if player_number == 1 else game_data["player_1"]

        # Retrieve opponent data
        cursor.execute("SELECT * FROM user WHERE id = ?", (opponent_id,))
        opponent_data = cursor.fetchone()
        opponent_username = opponent_data["username"]

        # Update session info w/ game data
        Session.set(SessionKeys.HAS_ONGOING_GAME, True)
        Session.set(SessionKeys.ONGOING_GAME_ID, game_id)
        Session.set(SessionKeys.ONGOING_GAME_ROOM_ID, room_id)

        # I don't think I ever use or update these
        # session["ongoing_game_player_number"] = player_number
        # session["ongoing_game_player_turn"] = player_turn
        # session["ongoing_game_opponent_id"] = opponent_id
        # session["ongoing_game_opponent_username"] = opponent_username

        # Send event with game, player, and opponent data
        emit("join-game", {
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
                    "player_marker": player_marker,
                },
                "opponent": {
                    "opponent_id": opponent_id,
                    "opponent_username": opponent_username,
                    "opponent_player_number": opponent_player_number
                },
            }}, room=request.sid)
        return

    def make_move(self, response_data):
        # Check if user has an ongoing game
        if not Session.get(SessionKeys.HAS_ONGOING_GAME):
            return

        # Check if response data was provided
        if response_data is None:
            emit("make-move", {
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
                move_coordinate) == 2 or not isinstance(move_coordinate[0], int) or not isinstance(move_coordinate[1],
                                                                                                   int):
            emit("make-move", {
                "success": False,
                "error_code": 400,
                "error_message": "Provided data does not contain proper coordinate",
                "data": {},
            }, room=request.sid)

        # Retrieve session data
        user_id = Session.get(SessionKeys.USER_ID)
        game_id = Session.get(SessionKeys.ONGOING_GAME_ID)
        room_id = Session.get(SessionKeys.ONGOING_GAME_ROOM_ID)

        # TODO - what to do if either is null?

        # Retrieve game data from db
        db = get_db()
        cursor = db.cursor()
        select_game_data_query = "SELECT game.*, game_board.* FROM game JOIN game_board " \
                                 "ON game.id = game_board.game_id WHERE game.id = ? "
        cursor.execute(select_game_data_query, (game_id,))
        game_data = cursor.fetchone()

        # Check if the player is part of this game
        if game_data is None or (game_data["player_1"] != user_id and game_data["player_2"] != user_id):
            emit("make-move", {
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

        # Check if it's the player's turn to make a move
        if next_move_by != user_id:
            emit("make-move", {
                "success": False,
                "error_code": 400,
                "error_message": "Not user's turn to make a move.",
                "data": {},
            }, room=request.sid)
            return

        # Check if the player has already made a move
        if last_move_by == user_id:
            emit("make-move", {
                "success": False,
                "error_code": 400,
                "error_message": "You already made a move.",
                "data": {},
            }, room=request.sid)
            return

        # Check if the game is still ongoing
        if game_data["winner"] is not None:
            emit("make-move", {
                "success": False,
                "error_code": 400,
                "error_message": "The game has ended.",
                "data": {},
            }, room=request.sid)
            return

        # Check if the move coordinate is within the game board limits
        if not (0 <= move_row <= 2 and 0 <= move_col <= 2):
            emit("make-move", {
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
            emit("make-move", {
                "success": False,
                "error_code": 400,
                "error_message": "Cell is already taken.",
                "data": {},
            }, room=request.sid)
            return

        update_player_move_query = f"UPDATE game_board SET {cell_name} = ?, next_move_by = ?, last_move_by = ? " \
                                   f"WHERE game_id = ?"
        cursor.execute(update_player_move_query, (player_marker, opponent_id, user_id, game_id,))
        db.commit()

        emit("move-made-successfully", {
            "success": True,
            "error_code": 200,
            "message": "Your move was made successfully.",
            "data": {}
        }, room=request.sid)

        # Emit event to the room with the move data
        emit("make-move", {
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
