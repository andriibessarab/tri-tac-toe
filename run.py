from app.__init__ import create_app


if __name__ == '__main__':
    app, socket = create_app()

    socket.run(app, debug=True, host="0.0.0.0", port=5001)
