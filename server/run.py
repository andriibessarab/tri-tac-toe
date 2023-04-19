import json
import random
import re
from functools import wraps

from flask import request, session
from flask_redis import Redis
from flask_socketio import SocketIO
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


@socket.on('connect')
def connect():
    print('Client connected: ', request.sid)


@socket.on('disconnect')
def disconnect():
    print('Client disconnected: ', request.sid)

    # # Delete the disconnected user from waiting list table
    # conn = sqlite3.connect('mydatabase.db')
    # c = conn.cursor()
    # c.execute("DELETE FROM waiting_list WHERE user_id = ?", (request.sid,))
    # conn.commit()
    # conn.close()


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
        db.execute(
            "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
            (username, email, generate_password_hash(password)),
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
    socket.emit('session', {
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


@socket.on('join-online-game')
@login_required(method_name="join-online-game")
def join_online_game():
    db = get_db()
    cursor = db.cursor()

    # Check if the user is already in Redis
    wait_list = redis_client.lrange("wait-list", 0, -1)
    for user in wait_list:
        if json.loads(user)["user_id"] == session.get("user_id"):
            return

    redis_client.rpush("wait-list", json.dumps({
        "user_id": session.get("user_id"),
        "username": session.get("username"),
        "request_id": request.sid
    }))

    if redis_client.llen("wait-list") < 2:
        return

    player1 = json.loads(redis_client.lpop("wait-list"))
    player2 = json.loads(redis_client.lpop("wait-list"))

    # Randomly choose which player goes first
    first_move = random.randint(1, 2)

    # Create game row in database
    cursor.execute(
        "INSERT INTO game (game_mode, player_1, player_2, first_turn) VALUES (?, ?, ?, ?)",
        ('online', player1["user_id"], player2["user_id"], first_move),
    )
    game_id = cursor.lastrowid
    db.commit()

    # Response for player 1
    socket.emit("join-online-game", {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "game_id": game_id,
            "opponent": {
                "user_id": player2["user_id"],
                "username": player2["username"],
            },
        }}, room=player1["request_id"])

    # Response for player 2
    socket.emit("join-online-game", {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "game_id": game_id,
            "opponent": {
                "user_id": player1["user_id"],
                "username": player1["username"],
            },
        }}, room=player2["request_id"])

    print(f"Game #{game_id} started between player #{player1['user_id']} and player #{player2['user_id']}")
    return


if __name__ == '__main__':
    socket.run(app, debug=True, port=5001)
