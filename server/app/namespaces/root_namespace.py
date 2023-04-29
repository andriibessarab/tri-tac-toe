from flask_socketio import Namespace


class RootNamespace(Namespace):

    def on_connect(self):
        pass

    def on_disconnect(self):
        pass
