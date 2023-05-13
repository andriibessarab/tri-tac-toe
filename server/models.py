from extensions import db


class User(db.Model):
    __tablename__ = "user"

    id = db.Column("id", db.Integer, nullable=False, unique=True, primary_key=True, autoincrement=True)
    username = db.Column("username", db.String, nullable=False, unique=True)
    email = db.Column("email", db.String, nullable=False, unique=True)
    password = db.Column("password", db.String, nullable=False)
    user_role = db.Column("user_role", db.Enum('adm', 'usr', 'ban'), nullable=False, default="usr")
    created_at = db.Column("created_at", db.DateTime, nullable=False, default=db.func.now())

    def to_json(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class Game(db.Model):
    __tablename__ = "game"

    id = db.Column("id", db.Integer, nullable=False, unique=True, primary_key=True, autoincrement=True)
    game_mode = db.Column(db.String, nullable=False, unique=False)
    join_code = db.Column(db.String, nullable=True, unique=True)
    player_1 = db.Column(db.Integer, nullable=False, unique=False, db.ForeignKey("user.id"))
    player_2 = db.Column(db.Integer, nullable=True, unique=False, db.ForeignKey("user.id"))
    player_1_marker = db.Column(db.Enum('x', 'o'), nullable=False, unique=False)
    player_2_marker = db.Column(db.Enum('x', 'o'), nullable=False, unique=False)
    winner = db.Column(db.Integer, nullable=True, unique=False, db.ForeignKey("user.id"))
    created_at = db.Column(db.TIMESTAMP, nullable=False, server_default=db.func.now())

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
