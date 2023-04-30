import re

from flask import request
from flask_socketio import Namespace, emit
from werkzeug.security import generate_password_hash, check_password_hash

from ..app_utils.Session import Session
from ..app_utils.SessionKeys import SessionKeys
from ..db import get_db

# Regex patterns for username, email, and password validation
USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"


class AuthNamespace(Namespace):
    """
    The AuthNamespace class handles all authentication-related events for the Flask-SocketIO server.

    Attributes:
        None

    Methods:
        on_connect()
            A SocketIO event handler for when a client connects to the server.

        on_disconnect()
            A SocketIO event handler for when a client disconnects from the server.

        on_register(data: dict)
            A SocketIO event handler for when a client registers for an account.

        on_login(data: dict)
            A SocketIO event handler for when a client logs into their account.

        on_logout(data: dict)
            A SocketIO event handler for when a client logs out of their account.

        on_session(data: dict)
            A SocketIO event handler for when a client requests their session data.
    """

    def on_connect(self):
        """
        A SocketIO event handler for when a client connects to the server.
        """
        pass

    def on_disconnect(self):
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
