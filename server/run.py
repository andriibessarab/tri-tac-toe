from flask import jsonify, request, session
from flask_socketio import SocketIO
from werkzeug.security import check_password_hash

from app.__init__ import create_app
from app.db import get_db

app = create_app()
socket = SocketIO(app, cors_allowed_origins="*")


# def login_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         if session.get('user_id') is None:
#             return jsonify({
#
#             })
#         return f(*args, **kwargs)
#     return decorated_function
#
#
# @socketio.on("connect")
# @login_required
# def connected():
#     """event listener when client connects to the server"""
#     print(request.sid)
#     print("client has connected")
#     emit("connect", {"data": f"id: {request.sid} is connected"})
#
#     # update the status of the user in the database
#     cursor.execute('UPDATE users SET status=? WHERE sid=?', ('connected', request.sid))
#     conn.commit()
#
# @socketio.on("disconnect")
# def disconnected():
#     """event listener when client disconnects to the server"""
#     print("user disconnected")
#     emit("disconnect", f"user {request.sid} disconnected", broadcast=True)
#
#     # update the status of the user in the database
#     cursor.execute('UPDATE users SET status=? WHERE sid=?', ('disconnected', request.sid))
#     conn.commit()

@socket.on('login')
def on_login(data):
    # Fetch event data
    username = data["username"]
    password = data["password"]

    # Retrieve user from database
    db = get_db()
    user = db.execute(
        "SELECT * FROM user WHERE username = ?", (username,)
    ).fetchone()

    # Check if user doesn't exist
    if user is None or not check_password_hash(user["password"], password):
        socket.emit('login', {
            "success": False,
            "error_code": 401,
            "error_message": "Incorrect username or password.",
            "data": {},
        }, room=request.sid)
        return

    session.clear()
    session["user_id"] = user["id"]

    # print(data)
    # user = User.query.filter_by(email=message['email']).first()
    # if not user:
    #    socket.emit('login', {'msg': "User not found"})
    #
    # if not user.check_password(form['password']):
    #    socket.emit('login', {'msg': "User not found"})
    #    return
    # user = UserSchema().dump(user).data
    # token = jwt.encode(
    #         {'id': user['id'], 'user': user['name']})
    # user['token'] = token.decode('UTF-8')
    socket.emit('login', {
        "success": True,
        "error_code": 200,
        "error_message": "",
        "data": {
            "user_id": session["user_id"],
            "username": user["username"],
            "email": user["email"],
        },
    }, room=request.sid)
    return


if __name__ == '__main__':
    socket.run(app, debug=True, port=5001)
