from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
socket = SocketIO(cors_allowed_origins=['https://multi-tac.herokuapp.com'], async_mode="gevent")
