def test_connect(socketio):
    print('Client connected')
    socketio.emit('my event', {'data': 'Client connected'})

