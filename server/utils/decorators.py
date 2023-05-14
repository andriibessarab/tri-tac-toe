import sqlite3
from functools import wraps

from flask import request, session
from flask_socketio import emit

from .session_keys import SessionKeys as s


# Require user to be authenticated
def login_required(event_name):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if s.USER not in session:
                emit(event_name, {
                    "success": False,
                    "error_code": 401,
                    "error_message": "User is not authorized.",
                    "data": {},
                }, room=request.sid)
                return
            return func(*args, **kwargs)

        return wrapper

    return decorator
