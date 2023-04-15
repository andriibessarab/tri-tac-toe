from flask import Flask
from flask_cors import CORS

app = Flask(__name__)


# Members API Route
@app.route("/members")
def members():
    return {"Members": ["memebr 1", "memmr 2"]}


def create_app():
    """
    Factory function for creating and configuring the Flask app instance.

    :return: A new Flask app instance.
    """
    app = Flask(__name__)
    CORS(app)

    # Configuration
    # app.config['SECRET_KEY'] = 'your-secret-key-here'

    return app
