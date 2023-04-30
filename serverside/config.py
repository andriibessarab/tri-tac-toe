import os


class Config:
    # Flask app config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    DATABASE = os.path.join(app.instance_path, "db.sqlite")

    # Redis config
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')
    REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', '')
    REDIS_DB = os.environ.get('REDIS_DB', 0)

    # CORS config
    CORS_ALLOW_ORIGINS = os.environ.get('CORS_ALLOW_ORIGINS', '*')


class DevelopmentConfig(Config):
    DEBUG = True

    def __init__(self):
        super().__init__()

        # Set environment variables for development
        if os.environ.get('FLASK_ENV') == 'development':
            os.environ['SECRET_KEY'] = 'dev'
            os.environ['REDIS_URL'] = 'redis://localhost:6379'
            os.environ['REDIS_PASSWORD'] = ''
            os.environ['REDIS_DB'] = '0'
            os.environ['CORS_ALLOW_ORIGINS'] = '*'


class ProductionConfig(Config):
    DEBUG = False
    REDIS_URL = os.environ.get('REDIS_URL')


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}
