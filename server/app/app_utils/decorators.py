import sqlite3
from functools import wraps

from flask import request, session



# Require user to be authenticated
def login_required(socket, event_name):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if 'user_id' not in session:
                socket.emit(event_name, {
                    "success": False,
                    "error_code": 401,
                    "error_message": "User is not authorized.",
                    "data": {},
                }, room=request.sid)
                return
            return func(*args, **kwargs)

        return wrapper

    return decorator


# Require user to have admin privileges
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
def not_in_another_game(socket, event_name):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if "has_game_ongoing" in session and session.get("has_game_ongoing"):
                # TODO is it the best idea to just send message?
                socket.emit(event_name, {
                    "success": False,
                    "error_code": 400,
                    "error_message": "You are already in a game.",
                    "data": {},
                }, room=request.sid)
                return
            return func(*args, **kwargs)

        return wrapper

    return decorator


def handle_errors(socket, func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except sqlite3.IntegrityError as e:
            if "CHECK constraint failed" in str(e):
                for player_request_id in [args[0]["request_id"], args[1]["request_id"]]:
                    socket.emit("join-wait", {
                        "success": True,
                        "error_code": 520,
                        "error_message": "Unknown server error occurred. Try to refresh the page!",
                        "data": {},
                    }, room=player_request_id)
            else:
                # Handle other IntegrityError cases here
                pass
        except KeyError:
            for player_request_id in [args[0]["request_id"], args[1]["request_id"]]:
                socket.emit("join-wait", {
                    "success": True,
                    "error_code": 520,
                    "error_message": "Unknown server error occurred. Try to refresh the page!",
                    "data": {},
                }, room=player_request_id)
        except Exception as e:
            socket.emit("join-wait", {
                "success": True,
                "error_code": 520,
                "error_message": "Unknown server error occurred. Try to refresh the page!",
                "data": {},
            }, room=player_request_id)

    return wrapper
