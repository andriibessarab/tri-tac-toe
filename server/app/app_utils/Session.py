from flask import session


class Session:
    @staticmethod
    def set(key, value):
        session[getattr(Session, key)] = value

    @staticmethod
    def get(key):
        return session.get(getattr(Session, key))

    @staticmethod
    def delete(key):
        session.pop(getattr(Session, key), None)

    @staticmethod
    def clear():
        session.clear()
