DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS post;

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('local', 'online', 'ai')),
    player_1 INTEGER NOT NULL REFERENCES user (id),
    player_2 INTEGER REFERENCES user (id),
    winner INTEGER REFERENCES user (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_winner CHECK (
        (winner = player_1) OR (winner = player_2) OR (winner IS NULL)
    )
);

CREATE TABLE game_move (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL REFERENCES game (id),
    user_id INTEGER NOT NULL REFERENCES user (id),
    marker TEXT NOT NULL CHECK (marker IN ('x', 'o')),
    row_index INTEGER NOT NULL CHECK (row_index >= 0 AND row_index <= 2),
    column_index INTEGER NOT NULL CHECK (column_index >= 0 AND column_index <= 2),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
