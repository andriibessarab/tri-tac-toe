import json

import bcrypt

from server.extensions import db


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, nullable=False, unique=True, primary_key=True, autoincrement=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    user_role = db.Column(db.Enum('adm', 'usr', 'ban', name='user_role'), nullable=False, default='usr')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_json(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

    def verify_password(self, password):
        password_bytes = bytes(password, 'UTF-8')

        # Remove the leading '\x' from the string
        hex_string = self.password.replace("\\x", "")

        # Convert the hex string to bytes
        hashed_password = bytes.fromhex(hex_string)

        return bcrypt.checkpw(password_bytes, hashed_password)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class Game(db.Model):
    __tablename__ = "game"

    id = db.Column("id", db.Integer, nullable=False, unique=True, primary_key=True, autoincrement=True)
    game_mode = db.Column(db.String, nullable=False, unique=False)
    join_code = db.Column(db.String, nullable=False, unique=True)
    player_1 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=False)
    player_2 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True, unique=False)
    player_1_marker = db.Column(db.Enum('x', 'o', name="player_1_marker"), nullable=False, unique=False)
    player_2_marker = db.Column(db.Enum('x', 'o', name="player_2_marker"), nullable=False, unique=False)
    winner = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True, unique=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=db.func.now())

    # Define relationships
    player1 = db.relationship(User, foreign_keys=[player_1])
    player2 = db.relationship(User, foreign_keys=[player_2])
    game_winner = db.relationship(User, foreign_keys=[winner])

    def to_json(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

    def get_room_id(self):
        return f"game-{self.id}"

    def get_players(self):
        players = User.query.filter(User.id.in_([self.player_1, self.player_2])).all()
        player_dict = {player.id: player.to_json() for player in players}
        return {
            "player_1": player_dict.get(self.player_1),
            "player_2": player_dict.get(self.player_2),
        }

    def get_winner(self):
        if self.winner:
            winner = User.query.get(self.winner)
            return winner.to_json() if winner else None
        else:
            return None

    def get_game_board(self):
        game_board = GameBoard.query.filter_by(game_id=self.id).first()
        return game_board if game_board else None

    def get_player_marker(self, user_id):
        if self.player_1 == user_id:
            return self.player_1_marker
        elif self.player_2 == user_id:
            return self.player_2_marker
        else:
            return None

    def get_user_id_from_marker(self, marker):
        if self.player_1_marker == marker:
            return self.player_1
        elif self.player_2_marker == marker:
            return self.player_2
        else:
            return None

    def get_opponent_id(self, user_id):
        if user_id == self.player_1:
            return self.player_2
        elif user_id == self.player_2:
            return self.player_1
        else:
            return None

    def check_win(self):
        board = self.get_game_board().get_board_state()
        for marker in ("x", "o"):
            # Check for horizontal win
            for i in range(3):
                if all(cell == marker for cell in board[i]):
                    return self.get_user_id_from_marker(marker)

            # Check for vertical win
            for j in range(3):
                if all(row[j] == marker for row in board):
                    return self.get_user_id_from_marker(marker)

            # Check for diagonal win
            if all(board[i][i] == marker for i in range(3)) or all(board[i][2 - i] == marker for i in range(3)):
                return self.get_user_id_from_marker(marker)

        return None

    def check_tie(self):
        board = self.get_game_board().get_board_state()
        for row in board:
            if '' in row:
                # If there's an empty space on the board, the game is not tied
                return False
        return True

    def is_game_full(self):
        return self.player_1 is not None and self.player_2 is not None

    def is_game_completed(self):
        return self.winner is not None or self.check_tie()

    def __repr__(self):
        return f"<Game(id={self.id}, join_code='{self.join_code}')>"


class GameBoard(db.Model):
    __tablename__ = "game_board"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    game_id = db.Column(db.Integer, db.ForeignKey("game.id"), nullable=False, unique=False)
    board_state = db.Column(db.String, nullable=False, unique=False)
    next_move_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=db.func.now())

    # Define relationships
    game = db.relationship(Game, backref="game_boards")
    user = db.relationship(User, backref="game_boards")

    def to_json(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

    def get_game(self):
        game = Game.query.get(self.game_id)
        return game.to_json() if game else None

    def get_user(self):
        user = User.query.get(self.next_move_by)
        return user.to_json() if user else None

    def get_board_state(self):
        return json.loads(self.board_state)

    def update_game_board_state(self, row, col, marker):
        if not row or not col or not marker or not self.is_cell_free(row, col):
            return False  # Return False if could not make a move

        board = self.get_board_state()
        board[row][col] = marker  # Update the board with the new move

        self.board_state = json.dumps(board)  # Update the board state in the database
        return True

    def is_cell_free(self, row, col):
        board = self.get_board_state()
        return board[row][col] == ""

    def __repr__(self):
        return f"<GameBoard(id={self.id}, game_id='{self.game}', next_move_by='{self.next_move_by}')>"
