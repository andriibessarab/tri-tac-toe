from os import environ

FLASK_APP = environ.get("FLASK_APP")
FLASK_ENV = environ.get("FLASK_ENV")

SECRET_KEY = environ.get("SECRET_KEY")

SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
#SQLALCHEMY_DATABASE_URI = environ.get("SQLALCHEMY_DATABASE_URI")
SQLALCHEMY_ECHO = False
SQLALCHEMY_TRACK_MODIFICATIONS = False
