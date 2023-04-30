from flask_socketio import SocketIO

from app.__init__ import create_app
from app.namespaces.auth_namespace import AuthNamespace
from app.namespaces.game_namespace import GameNamespace
from app.namespaces.root_namespace import RootNamespace

if __name__ == '__main__':
    app, redis = create_app()

    # Create a Flask-SocketIO server
    socket = SocketIO(app, cors_allowed_origins="*")

    # Register the namespaces with the socketio object
    socket.on_namespace(RootNamespace("/"))
    socket.on_namespace(AuthNamespace("/auth"))
    socket.on_namespace(GameNamespace("/game", redis))

    # Run the SocketIO web server
    socket.run(app, debug=True, port=5001)
