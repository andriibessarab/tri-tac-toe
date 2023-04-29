import json
import random
import sqlite3

from flask import request
from flask_socketio import Namespace, emit, join_room

from ..app_utils.Session import Session
from ..app_utils.SessionKeys import SessionKeys
from ..db import get_db


class GameNamespace(Namespace):
    def __init__(self, namespace=None, redis=None):
        super().__init__()

        if redis is None:
            raise ValueError("Redis connection cannot be None.")
        self.redis = redis

    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    def on_join_wait(self, data):
        """
        Pair 2 players for game and send out generic game data
        :return: nothing
        """

        # Check if the user is already in Redis, and remove the old request
        wait_list = self.redis.lrange("wait-list", 0, -1)
        for user in wait_list:
            if json.loads(user)["user_id"] == Session.get(SessionKeys.USER_ID):
                self.redis.lrem("wait-list", 0, json.dumps({"user_id": Session.get(SessionKeys.USER_ID)}))

        # Add user data to redis db
        self.redis.rpush("wait-list", json.dumps({
            "user_id": Session.get(SessionKeys.USER_ID),
            "username": Session.get(SessionKeys.USER_NAME),
            "request_id": request.sid
        }))

        # Check if wait list has less than two users
        if self.redis.llen("wait-list") < 2:
            return

        # Pick two players for game
        player1 = json.loads(self.redis.lpop("wait-list"))
        player1_user_id = player1["user_id"]
        player1_request_id = player1["request_id"]
        player2 = json.loads(self.redis.lpop("wait-list"))
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
                "INSERT INTO game (game_mode, player_1, player_2, player_1_marker, player_2_marker) " \
                "VALUES (?, ?, ?, ?, ?)",
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
