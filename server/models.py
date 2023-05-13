import bcrypt

from server.extensions import db


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, nullable=False, unique=True, primary_key=True, autoincrement=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    user_role = db.Column(db.Enum('adm', 'usr', 'ban'), nullable=False, default="usr")
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_json(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

    def verify_password(self, password):
        password_bytes = password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, self.password)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class Game(db.Model):
    __tablename__ = "game"

    id = db.Column("id", db.Integer, nullable=False, unique=True, primary_key=True, autoincrement=True)
    game_mode = db.Column(db.String, nullable=False, unique=False)
    join_code = db.Column(db.String, nullable=True, unique=True)
    player_1 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=False)
    player_2 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True, unique=False)
    player_1_marker = db.Column(db.Enum('x', 'o'), nullable=False, unique=False)
    player_2_marker = db.Column(db.Enum('x', 'o'), nullable=False, unique=False)
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

    def is_full(self):
        return self.get_players_count() == 2

    def is_completed(self):
        return self.winner is not None

    def __repr__(self):
        return f"<Game(id={self.id}, join_code='{self.join_code}')>"


class GameBoard(db.Model):
    __tablename__ = "game_board"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    game_id = db.Column(db.Integer, db.ForeignKey("game.id"), nullable=False, unique=True)
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

    def __repr__(self):
        return f"<GameBoard(id={self.id}, game_id='{self.game}', next_move_by='{self.next_move_by}')>"
