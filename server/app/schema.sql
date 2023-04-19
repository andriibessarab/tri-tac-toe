DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS post;

CREATE TABLE user
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT UNIQUE NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT        NOT NULL,
    user_status TEXT        NOT NULL DEFAULT 'reg' CHECK (user_status IN ('adm', 'reg', 'ban')),
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    game_mode   TEXT    NOT NULL CHECK (game_mode IN ('local', 'online', 'ai')),
    player_1    INTEGER NOT NULL REFERENCES user (id),
    player_2    INTEGER REFERENCES user (id),
    winner      INTEGER          DEFAULT NULL REFERENCES user (id),
    is_finished INTEGER NOT NULL DEFAULT 0 CHECK (first_turn IN (1, 2)),
    first_turn  INTEGER NOT NULL CHECK (first_turn IN (1, 2)),
    created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_players CHECK (player_1 != player_2),
    CONSTRAINT valid_winner CHECK ((winner = player_1) OR (winner = player_2) OR (winner IS NULL))
);


CREATE TABLE game_move
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id      INTEGER   NOT NULL REFERENCES game (id),
    user_id      INTEGER   NOT NULL REFERENCES user (id),
    marker       TEXT      NOT NULL CHECK (marker IN ('x', 'o')),
    row_index    INTEGER   NOT NULL CHECK (row_index >= 0 AND row_index <= 2),
    column_index INTEGER   NOT NULL CHECK (column_index >= 0 AND column_index <= 2),
    board_state  TEXT      NOT NULL, -- store the current state of the game board as a string
    is_finished  INTEGER   NOT NULL DEFAULT 0 CHECK (is_finished = 0 OR is_finished = 1),
    created      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE waiting_room
(
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   TEXT      NOT NULL UNIQUE REFERENCES user (id),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
