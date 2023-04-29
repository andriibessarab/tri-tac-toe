from flask_socketio import Namespace, emit


class TestNamespace(Namespace):
    def on_connect(self):
        print("connected")
        emit('my_response', "hello")

    def on_disconnect(self):
        pass

    def on_my_event(self, data):
        emit('my_response', data)
