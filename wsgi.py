import eventlet
from dotenv import load_dotenv
from eventlet import wsgi

from server.__init__ import create_app

app, socket = create_app()

if __name__ == '__main__':
    load_dotenv()  # take environment variables from .env
    eventlet_socket = eventlet.listen(("", 5001))
    wsgi.server(eventlet_socket, app)
