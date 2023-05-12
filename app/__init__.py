import os

from flask import Flask
from flask_cors import CORS
from flask_redis import Redis

from . import db
from flask_socketio import SocketIO

from .events import SockerEvents


def create_app():
    """
    Create and configure the Flask application instance.

    Returns:
        Flask: Flask instance and SocketIO instance.
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


        # Create a Flask-SocketIO server
        socket = SocketIO(app, cors_allowed_origins="*")

        # Register the namespaces with the socketio object
        socket.on_namespace(SockerEvents("/"))

        return app, socket
