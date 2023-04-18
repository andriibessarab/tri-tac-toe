from flask import jsonify, request, session
from flask_socketio import SocketIO
from werkzeug.security import check_password_hash, generate_password_hash

from app.__init__ import create_app
from app.db import get_db
import re

app = create_app()
socket = SocketIO(app, cors_allowed_origins="*")


# Regex patterns for username, email, and password validation
USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"

# def login_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         if session.get('user_id') is None:
#             return jsonify({
#
#             })
#         return f(*args, **kwargs)
#     return decorated_function
#
#
# @socketio.on("connect")
# @login_required
# def connected():
#     """event listener when client connects to the server"""
#     print(request.sid)
#     print("client has connected")
#     emit("connect", {"data": f"id: {request.sid} is connected"})
#
#     # update the status of the user in the database
#     cursor.execute('UPDATE users SET status=? WHERE sid=?', ('connected', request.sid))
#     conn.commit()
#
# @socketio.on("disconnect")
# def disconnected():
#     """event listener when client disconnects to the server"""
#     print("user disconnected")
#     emit("disconnect", f"user {request.sid} disconnected", broadcast=True)
#
#     # update the status of the user in the database
#     cursor.execute('UPDATE users SET status=? WHERE sid=?', ('disconnected', request.sid))
#     conn.commit()


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
def session_info():
    user_id = session.get("user_id")

    # Check if user is not authorized
    if user_id is None:
        socket.emit('session', {
            "success": False,
            "error_code": 401,
            "error_message": "User is not authorized.",
            "data": {},
        }, room=request.sid)
        return

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


if __name__ == '__main__':
    socket.run(app, debug=True, port=5001)
