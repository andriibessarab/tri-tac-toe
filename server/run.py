import re
from functools import wraps

from flask import request, session, jsonify
from flask_socketio import SocketIO
from werkzeug.security import check_password_hash, generate_password_hash

from app.__init__ import create_app
from app.db import get_db

app = create_app()
socket = SocketIO(app, cors_allowed_origins="*")

# Regex patterns for username, email, and password validation
USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"


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
    return


@socket.on('logout')
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
    return


@socket.on('session')
@login_required(method_name="session")
def session_info():
    user_id = session.get("user_id")

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
    return


@socket.on('join-online-game')
@login_required(method_name="join-online-game")
def join_online_game():
    user_id = session.get("user_id")

    # try:
    #     db.execute(
    #         "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
    #         (username, email, generate_password_hash(password)),
    #     )
    #     db.commit()
    # except db.IntegrityError:
    #     socket.emit('register', {
    #         "success": False,
    #         "error_code": 409,
    #         "error_message": "Username or email is/are already in-use.",
    #         "data": {},
    #     }, room=request.sid)
    #     return
    # else:
    #     socket.emit('register', {
    #         "success": True,
    #         "error_code": 200,
    #         "error_message": "",
    #         "data": {},
    #     }, room=request.sid)
    # return

    socket.emit('register', {
            "success": True,
            "error_code": 200,
            "error_message": f"user {user_id} joined wait room",
            "data": {},
    }, room=request.sid)
    return


if __name__ == '__main__':
    socket.run(app, debug=True, port=5001)
