import sqlite3

import click
from flask import current_app, g


def get_db():
    """
    Connect to the database.

    This function creates a new connection to the database if there is none yet for the current application context.

    Returns:
        sqlite3.Connection: A connection to the database.

    """
    if 'db' not in g:
        # Connect to the database using the configuration from the application context
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        # Set row_factory to sqlite3.Row for returning rows as dictionaries
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(e=None):
    """
    Close the database connection.

    This function removes the database connection from the application context and closes the connection.

    Args:
        e: The error object, if any.

    """
    db = g.pop('db', None)

    if db is not None:
        db.close()


def init_db():
    """
    Initialize the database.

    This function initializes the database by executing the schema.sql file which contains the SQL commands to create
    the necessary tables and indices.

    """
    db = get_db()

    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))


@click.command('init-db')
def init_db_command():
    """
    Initialize the database command.

    This function creates a new command for the Flask command-line interface to initialize the database by calling
    the init_db function.

    """
    init_db()
    click.echo('Initialized the database.')


def init_app(app):
    """
    Initialize the Flask application.

    This function adds the close_db function to the Flask application's teardown_appcontext event, and adds the
    init_db_command command to the Flask command-line interface.

    Args:
        app: The Flask application instance.

    """
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
