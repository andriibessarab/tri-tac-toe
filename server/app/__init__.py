import os

from flask import Flask
from flask import (jsonify)
from flask_cors import CORS


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY="dev",  # TODO should be overridden with a random value when deploying
        DATABASE=os.path.join(app.instance_path, "db.sqlite"),
    )

    # enable CORS for all domains on all routes
    CORS(app, resources={r"/*": {"origins": "*"}})

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/http-call")
    def http_call():
        """return JSON with string data as the value"""
        data = {'data': 'This text was fetched using an HTTP call to server on render'}
        return jsonify(data)

    @app.errorhandler(405)
    def method_not_allowed_error(error):
        return jsonify({
            "success": False,
            "error_code": 405,
            "error_message": "Method not allowed",
            "data": {}
        }), 405

    # init database
    from . import db
    db.init_app(app)

    # reg auth bp
    from . import auth
    app.register_blueprint(auth.auth_bp)

    return app
