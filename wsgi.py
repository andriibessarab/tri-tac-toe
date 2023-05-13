from eventlet import wsgi
import eventlet

from server.__init__ import create_app

app, socket = create_app()

if __name__ == '__main__':
    eventlet_socket = eventlet.listen(("", 5001))
    wsgi.server(eventlet_socket, app)