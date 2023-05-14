from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
socket = SocketIO(cors_allowed_origins=['http://multi-tac.herokuapp.com'])
