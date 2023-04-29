from ..app import socket
from ..decorators import login_required, admin_required


@socket.on("clear-redis-db")
@login_required(socket, event_name="clear-redis-db")
@admin_required()
def clear_redis_db():
    redis_client.flushdb()
    print('Redis DB cleared.')


@socket.on("remove-all-groups")
@login_required(socket, event_name="remove-all-groups")
@admin_required()
def remove_all_groups():
    socket.server.manager.disconnect_all()
    print('All SocketIO groups removed.')
