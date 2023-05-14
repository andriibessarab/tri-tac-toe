import json
import random
import re

import bcrypt
from flask import request, session
from flask_socketio import Namespace, emit, join_room, rooms
from sqlalchemy import exc

from server.extensions import db
from .models import User, Game, GameBoard
from .utils.decorators import login_required
from .utils.session_keys import SessionKeys as s, SessionKeys
from .utils.validation_patterns import ValidationPatterns as vp


class SocketEvents(Namespace):
    def on_connect(self, data=None):
        pass

    def on_disconnect(self, data=None):
        pass

    def on_register(self, data=None):
        # Fetch event data
        username = data["username"]
        email = data["email"]
        password = data["password"]

        # Validate username
        if not re.match(vp.USERNAME_PATTERN, username):
            emit("register-fail", {
                "success": False,
                "error_code": 422,
                "error_message": "Username is invalid.",
                "data": {},
            }, room=request.sid)
            return

        # Validate email
        if not re.match(vp.EMAIL_PATTERN, email):
            emit("register-fail", {
                "success": False,
                "error_code": 422,
                "error_message": "Email is invalid.",
                "data": {},
            }, room=request.sid)
            return

        # Validate password
        if not re.match(vp.PASSWORD_PATTERN, password):
            emit("register-fail", {
                "success": False,
                "error_code": 422,
                "error_message": "Password must contain at least 8 characters, one uppercase letter, one lowercase "
                                 "letter, and one number. ",
                "data": {},
            }, room=request.sid)
            return

        password_bytes = password.encode('utf-8')
        hashpw = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

        try:
            # Create a new user instance
            new_user = User(username=username, email=email, password=hashpw)

            # Add the user to the session and commit the changes
            db.session.add(new_user)
            db.session.commit()
        except exc.IntegrityError as e:
            emit("register-fail", {
                "success": False,
                "error_code": 409,
                "error_message": "Username or email is/are already in-use.",
                "data": {},
            }, room=request.sid)
        else:
            emit("register-success", {
                "success": True,
                "error_code": 200,
                "error_message": "",
                "data": {},
            }, room=request.sid)
            print(f"Client registered: {username}")

    def on_login(self, data=None):
        # Fetch event data
        username = data["username"]
        password = data["password"]

        # Select a user by their username
        user = User.query.filter_by(username=username).first()

        # Check if user doesn't exist
        if user is None or not user.verify_password(password):
            emit("login-fail", {
                "success": False,
                "error_code": 401,
                "error_message": "Incorrect username or password.",
                "data": {},
            }, room=request.sid)
            return

        # Clear session and add user
        session.clear()
        session[s.USER] = user

        # Return 200 & user data
        emit("login-success", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }, room=request.sid)

    def on_logout(self, data=None):
        user = session.get(s.USER)

        # Clear session
        session.clear()

        # Return 200
        emit("logout", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {},
        }, room=request.sid)

    @login_required(event_name="create_game_fail")
    def on_create_game(self, data=None):
        user = session.get(s.USER)

        # Randomly choose which player goes first
        first_move_player_number = random.randint(1, 2)

        # Randomly assign marker to both players
        player1_marker, player2_marker = random.sample(["x", "o"], k=2)

        # Randomly generate join code
        join_code = str(random.randint(100000, 999999))

        # Generate empty board
        board = json.dumps([["", "", ""], ["", "", ""], ["", "", ""]])

        # Create new game and game board
        try:
            new_game = Game(game_mode="online", join_code=join_code, player_1=user.id, player_1_marker=player1_marker,
                            player_2_marker=player2_marker)

            # Add new game to the session
            db.session.add(new_game)

            # Commit game to the database
            db.session.commit()

            new_game_board = GameBoard(game_id=new_game.id, board_state=board, next_move_by=user.id)

            # Add new game board to the session
            db.session.add(new_game_board)

            # Commit game board to the database
            db.session.commit()
        except exc.IntegrityError as e:
            emit("create_game_fail", {
                "success": False,
                "error_code": 409,
                "error_message": "Something went wrong when creating the game, please try again.",
                "data": {},
            }, room=request.sid)
        else:
            session[s.GAME] = new_game

            print(new_game, new_game_board)

            join_room(new_game.get_room_id(), sid=request.sid, namespace="/")

                # Response
            emit("create_game_success", {
                    "success": True,
                    "error_code": 200,
                    "error_message": "",
                    "data": {
                        "game": {
                            "join_code": new_game.join_code
                        },
             }}, room=request.sid)

    @login_required(event_name="join_game_fail")
    def on_join_game(self, data):
        # Retrieve session data
        user = session.get(s.USER)

        # Store response data
        join_code = data["join_code"]

        # Check if join_code is valid
        if not re.match(vp.JOIN_CODE_PATTERN, join_code):
            emit("join_game_fail", {
                "success": False,
                "error_code": 400,
                "error_message": "Invalid join code.",
                "data": {},
            }, room=request.sid)
            return

        # Select a user by their username
        game = Game.query.filter_by(join_code=join_code).first()

        if game is None:
            emit("join_game_fail", {
                "success": False,
                "error_code": 400,
                "error_message": f"Game with code {join_code} does not exist.",
                "data": {},
            }, room=request.sid)
            return

        if game.is_game_completed():
            emit("join_game_fail", {
                "success": False,
                "error_code": 400,
                "error_message": f"This game is finished.",
                "data": {},
            }, room=request.sid)
            return

        if game.is_game_full():
            emit("join_game_fail", {
                "success": False,
                "error_code": 400,
                "error_message": f"This game is full.",
                "data": {},
            }, room=request.sid)
            return

        if game.player_1 == user.id or game.player_2 == user.id:
            emit("join_game_fail", {
                "success": False,
                "error_code": 400,
                "error_message": f"Cannot join your own game:)",
                "data": {},
            }, room=request.sid)
            return

        # Update player_2 of game
        game.player_2 = user.id
        db.session.commit()

        session[s.GAME] = game

        join_room(game.get_room_id(), sid=request.sid, namespace="/")

        emit("game_starts", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {
                "player_1": {
                    "user_id": game.player_1,
                    "marker": game.player_1_marker,
                },
                "player_2": {
                    "user_id": game.player_2,
                    "marker": game.player_2_marker,
                },
                "next_turn_by": game.player_1,  # TODO should instead retrieve from game_board table
            },
        }, room=game.get_room_id())

    @login_required(event_name="make_move_fail")
    def on_make_move(self, response_data):
        # Check if user has an ongoing game
        # if not session.get(SessionKeys.HAS_ONGOING_GAME):
        #     return

        # Check if response data was provided
        if response_data is None:
            emit("make_move_fail", {
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
                move_coordinate) == 2 or not isinstance(move_coordinate[0], int) or not isinstance(
                move_coordinate[1], int):
            emit("make_move_fail", {
                "success": False,
                "error_code": 400,
                "error_message": "Provided data does not contain proper coordinate.",
                "data": {},
            }, room=request.sid)
            return

        # Check if the move coordinate is within the game board limits
        if not (0 <= move_row <= 2 and 0 <= move_col <= 2):
            emit("make_move_fail", {
                "success": False,
                "error_code": 400,
                "error_message": "Invalid move.",
                "data": {},
            }, room=request.sid)
            return

        # Retrieve session data
        user = session.get(s.USER)
        game = session.get(s.GAME)

        # TODO - what to do if either is null?

        # Make sure game and game board are up-to-date
        game = Game.query.get(game.id)
        game_board = game.get_game_board()
        board_state = game_board.get_board_state()

        # TODO - what if game board is null

        # Check if player is not part of this game
        if game is None or (game.player_1 != user.id and game.player_2 != user.id):
            emit("make_move_fail", {
                "success": False,
                "error_code": 400,
                "error_message": "User is not part of this game.",
                "data": {},
            }, room=request.sid)
            return

        # Check if it's not player's turn to make a move
        if game_board.next_move_by != user.id:
            emit("make_move_fail", {
                "success": False,
                "error_code": 400,
                "error_message": "Not user's turn to make a move.",
                "data": {},
            }, room=request.sid)
            return

        # Check if the game is over
        if game.winner is not None:
            emit("make_move_fail", {
                "success": False,
                "error_code": 400,
                "error_message": "The game has ended.",
                "data": {},
            }, room=request.sid)
            return

        # Check if cell is taken
        if not game_board.is_cell_free(move_row, move_col):
            emit("make_move_fail", {
                "success": False,
                "error_code": 400,
                "error_message": "Cell is taken.",
                "data": {},
            }, room=request.sid)
            return

        board_state[move_row][move_col] = game.get_player_marker(user.id)
        game_board.board_state = json.dumps(board_state)
        game_board.next_move_by = game.get_opponent_id(user.id)
        db.session.commit()

        # Check for winner
        winner = game.check_win()
        if winner is not None:
            game.winner = winner
            db.session.commit()
            emit("game_ends", {
                "success": True,
                "error_code": 200,
                "error_message": "",
                "data": {
                    "previous_move": {
                        "player_id": user.id,
                        "player_marker": game.get_player_marker(user.id),
                        "move_coordinate": move_coordinate,
                    },
                    "winner": {
                        "id": game.winner,
                        "marker": game.get_player_marker(winner)
                    },
                },
            }, room=game.get_room_id())
            db.commit()
            return

        # Check for tie
        if game.check_tie():
            emit("game_ends", {
                "success": True,
                "error_code": 200,
                "error_message": "",
                "data": {
                    "previous_move": {
                        "player_id": user.id,
                        "player_marker": game.get_player_marker(user.id),
                        "move_coordinate": move_coordinate,
                    },
                    "winner": {
                        "id": "tie",
                        "marker": None
                    },
                },
            }, room=game.get_room_id())
            return

        # Emit event to the room with the move data
        emit("make_move_success", {
            "success": True,
            "error_code": 200,
            "error_message": "",
            "data": {
                "previous_move": {
                    "player_id": user.id,
                    "player_marker": game.get_player_marker(user.id),
                    "move_coordinate": move_coordinate,
                },
                "next_move": {
                    "player_id": game.get_opponent_id(user.id),
                },

            },
        }, room=game.get_room_id())
