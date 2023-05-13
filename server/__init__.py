import os

from flask import Flask
from flask.helpers import send_from_directory
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

from .events import SockerEvents


def create_app():
    # Create a Flask-SocketIO server
    app = Flask(__name__, static_folder='../client/build', static_url_path='')

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass  # TODO handle case where os folder is not defined

    # Configure server
    app.config.from_mapping(
        SECRET_KEY="dev",  # TODO should be overridden with a random value when deploying
        SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL"),
    )
    # app.config.from_pyfile("config.py", silent=True)

    # Enable CORS for all domains on all routes
    CORS(app, resources={r"/*": {"origins": "*"}})

    from .extensions import db
    db.init_app(app)  # initialize a Flask application for use with this extension instance


    # Create a Flask-SocketIO server
    socket = SocketIO(app, cors_allowed_origins="*")

    # Register the namespaces with the socketio object
    socket.on_namespace(SockerEvents("/"))

    @app.route('/')
    @cross_origin()
    def serve():
        return send_from_directory(app.static_folder, 'index.html')

    # Create the table schema in the database
    with app.app_context():
        db.create_all()

    return app, socket