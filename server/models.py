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
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "user_role": self.user_role,
            "created_at": self.created_at,
        }

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

