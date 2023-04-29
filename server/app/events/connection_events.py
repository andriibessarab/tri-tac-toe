from ..app import socket


@socket.on('connect')
def connect():
    return


@socket.on('disconnect')
def disconnect():
    # Remove user from wait room
    redis_client.lrem("wait-list", 0, json.dumps({"user_id": Session.get(SessionKeys.USER_ID)}))

    # Clear session
    session.clear()

    # Remove user from ongoing games
    # TODO Remove disconnected users from any ongoing games
