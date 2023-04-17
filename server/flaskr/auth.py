import re

from flask import (
    Blueprint, g, request, session, jsonify
)
from werkzeug.security import check_password_hash, generate_password_hash

from .db import get_db

# Regex patterns for username, email, and password validation
USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    username = request.form["username"]
    email = request.form["email"]
    password = request.form["password"]
    db = get_db()

    if not re.match(USERNAME_PATTERN, username):
        return jsonify({
            "success": False,
            "error_code": 422,
            "error_message": "Username is invalid.",
            "data": {},
        }), 422
    if not re.match(EMAIL_PATTERN, email):
        return jsonify({
            "success": False,
            "error_code": 422,
            "error_message": "Email is invalid.",
            "data": {},
        }), 422
    if not re.match(PASSWORD_PATTERN, password):
        return jsonify({
            "success": False,
            "error_code": 422,
            "error_message": "Password must contain at least 8 characters, one uppercase letter, one lowercase "
                             "letter, and one number. ",
            "data": {},
        }), 422

    try:
        db.execute(
            "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
            (username, email, generate_password_hash(password)),
        )
        db.commit()
    except db.IntegrityError:
        return jsonify({
            "success": False,
            "error_code": 409,
            "error_message": "Username or email is/are already in-use.",
            "data": {},
        }), 409
    else:
        return jsonify({
            "success": True,
            "error_code": 200,
            "error_message": None,
            "data": {},
        }), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    db = get_db()
    user = db.execute(
        "SELECT * FROM user WHERE username = ?", (username,)
    ).fetchone()

    if user is None or not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "error_code": 401,
            "error_message": "Incorrect username or password.",
            "data": {},
        }), 401

    session.clear()
    session["user_id"] = user["id"]

    return jsonify({
        "success": True,
        "error_code": 200,
        "error_message": None,
        "data": {
            "user_id": session["user_id"],
            "username": user["username"],
            "email": user["email"],
        },
    }), 200


@auth_bp.route('/logout', methods=["POST"])
def logout():
    session.clear()
    return jsonify({
        "success": True,
        "error_code": 200,
        "error_message": None,
        "data": {},
    }), 200


@auth_bp.route("/session", methods=["GET"])
def get_session_info():
    user_id = session.get("user_id")
    if user_id is not None:
        return jsonify({
            "success": True,
            "error_code": 200,
            "error_message": None,
            "data": {
                "user_id": user_id,
                "username": g.user["username"],
                "email": g.user["email"]
            },
        }), 200
    else:
        return jsonify({
            "success": False,
            "error_code": 401,
            "error_message": "User is not logged in.",
            "data": {},
        }), 401


@auth_bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()
