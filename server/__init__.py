import os

from flask import Flask
from flask.helpers import send_from_directory
from flask_cors import CORS, cross_origin

from server.events import SocketEvents


def create_app(config_file="config.py"):
    # Create a Flask-SocketIO server
    app = Flask(__name__, static_folder='../client/build', static_url_path='')
    app.config.from_pyfile(config_file, silent=True)

    # Enable CORS for all domains on all routes
    CORS(app, resources={r"/*": {"origins": "*"}})

    from .extensions import db, socket
    db.init_app(app)  # init Flask app for use w/ this extension instance
    socket.init_app(app)  # init Flask app for use w/ socket

    # Register the namespaces with the socketio object
    socket.on_namespace(SocketEvents("/"))

    @app.route('/')
    @cross_origin()
    def serve():
        return send_from_directory(app.static_folder, 'index.html')

    # Create the table schema in the database
    with app.app_context():
        db.create_all()

    return app
