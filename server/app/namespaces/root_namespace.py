from flask_socketio import Namespace


class RootNamespace(Namespace):
    """
    The root namespace for the Socket.IO server.

    This namespace provides the base functionality for the Socket.IO server, including handling of
    connections and disconnections.

    Attributes:
        None.

    Methods:
        on_connect(): Called when a client connects to the Socket.IO server.
        on_disconnect(): Called when a client disconnects from the Socket.IO server.
    """

    def on_connect(self):
        """
        Handle a connection from a client.

        This method is called when a client connects to the Socket.IO server.

        Args:
            self (RootNamespace): The RootNamespace instance.

        Returns:
            None.
        """
        pass

    def on_disconnect(self):
        """
        Handle a disconnection from a client.

        This method is called when a client disconnects from the Socket.IO server.

        Args:
            self (RootNamespace): The RootNamespace instance.

        Returns:
            None.
        """
        pass
