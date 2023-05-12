from server.__init__ import create_app

app, socket = create_app()

if __name__ == '__main__':
    socket.run(app, debug=True, host="0.0.0.0", port=5001)
