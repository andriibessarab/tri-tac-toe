import os

from flask import Flask
from flask_cors import CORS
from flask_redis import Redis
from flask_socketio import SocketIO

from server.app import db
from server.app.namespaces.auth_namespace import AuthNamespace
from server.app.namespaces.game_namespace import GameNamespace
from server.app.namespaces.root_namespace import RootNamespace

# from server.app.app_utils.Session import Session
# from server.app.app_utils.SessionKeys import SessionKeys

# Create and configure the app
app = Flask(__name__, instance_relative_config=True)
app.config.from_mapping(
    SECRET_KEY="dev",  # TODO should be overridden with a random value when deploying
    DATABASE=os.path.join(app.instance_path, "db.sqlite"),
)
# Session(app)

# enable CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

app.config.from_pyfile("config.py", silent=True)

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass  # TODO handle case where os folder is not defined

with app.app_context():
    # Initialize database
    db.init_app(app)
    db.init_db()

    # Create a Flask-SocketIO server
    socket = SocketIO(app, cors_allowed_origins="*")

    # Initialize Redis extension for Flask application.
    redis = Redis()
    redis.init_app(app)
    redis.flushdb()

    # Register the namespaces with the socketio object
    socket.on_namespace(RootNamespace("/"))
    socket.on_namespace(AuthNamespace("/auth"))
    socket.on_namespace(GameNamespace("/game", redis))

if __name__ == "__main__":
    socket.run(app, debug=True, port=5001)
