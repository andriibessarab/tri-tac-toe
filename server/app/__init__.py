import os

from flask import Flask
from flask_cors import CORS
from flask_redis import Redis
from flask_socketio import SocketIO

from . import db
from .namespaces.auth_namespace import AuthNamespace
from .namespaces.game_namespace import GameNamespace
from .namespaces.root_namespace import RootNamespace

def create_app():
    """
    Create and configure the Flask application instance.

    Returns:
        Flask: The SocketIO instance.
    """

    # Create a Flask-SocketIO server
    app = Flask(__name__, instance_relative_config=True)

    # Configure app
    app.config.from_mapping(
        SECRET_KEY="dev",  # TODO should be overridden with a random value when deploying
        DATABASE=os.path.join(app.instance_path, "db.sqlite"),
    )

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

        # Initialize Redis extension for Flask application.
        redis = Redis()
        redis.init_app(app)
        redis.flushdb()

    return app, redis
