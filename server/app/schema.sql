-- Drop existing tables & triggers
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS game_board;
DROP TABLE IF EXISTS game_move;
DROP TABLE IF EXISTS waiting_room;
DROP TRIGGER IF EXISTS check_next_move_by;
DROP TRIGGER IF EXISTS check_last_move_by;


-- Create user table that stores information about the registered users of the system.
CREATE TABLE user
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT        NOT NULL,
    user_role  TEXT        NOT NULL DEFAULT 'usr' CHECK (user_role IN ('adm', 'usr', 'ban')),
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Create game table that stores information about played and ongoing games.
CREATE TABLE game
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_mode       TEXT      NOT NULL CHECK (game_mode IN ('local', 'online', 'ai')),
    join_code       INTEGER   UNIQUE CHECK ((game_mode <> 'online' AND join_code IS NULL) OR (game_mode = 'online' AND join_code IS NOT NULL)),
    player_1        INTEGER   NOT NULL REFERENCES user (id),
    player_2        INTEGER            REFERENCES user (id),
    player_1_marker TEXT      NOT NULL CHECK (player_1_marker IN ('x', 'o')),
    player_2_marker TEXT      NOT NULL CHECK (player_2_marker IN ('x', 'o')),
    winner          INTEGER            DEFAULT NULL REFERENCES user (id),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_players CHECK (player_1 <> player_2),
    CONSTRAINT valid_player_markers CHECK (player_1_marker <> player_2_marker),
    CONSTRAINT valid_winner CHECK ((winner = player_1) OR (winner = player_2) OR (winner IS NULL))
);


-- Create game_board table that stores information representing a tic-tac-toe board of a specific game.
CREATE TABLE game_board
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id      INTEGER UNIQUE NOT NULL REFERENCES game (id),
    cell_0_0     TEXT           NOT NULL DEFAULT '' CHECK (cell_0_0 IN ('', 'x', 'o')),
    cell_0_1     TEXT           NOT NULL DEFAULT '' CHECK (cell_0_1 IN ('', 'x', 'o')),
    cell_0_2     TEXT           NOT NULL DEFAULT '' CHECK (cell_0_2 IN ('', 'x', 'o')),
    cell_1_0     TEXT           NOT NULL DEFAULT '' CHECK (cell_1_0 IN ('', 'x', 'o')),
    cell_1_1     TEXT           NOT NULL DEFAULT '' CHECK (cell_1_1 IN ('', 'x', 'o')),
    cell_1_2     TEXT           NOT NULL DEFAULT '' CHECK (cell_1_2 IN ('', 'x', 'o')),
    cell_2_0     TEXT           NOT NULL DEFAULT '' CHECK (cell_2_0 IN ('', 'x', 'o')),
    cell_2_1     TEXT           NOT NULL DEFAULT '' CHECK (cell_2_1 IN ('', 'x', 'o')),
    cell_2_2     TEXT           NOT NULL DEFAULT '' CHECK (cell_2_2 IN ('', 'x', 'o')),
    next_move_by INTEGER        NOT NULL REFERENCES user (id),
    last_move_by INTEGER                 DEFAULT NULL REFERENCES user (id),
    created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Create wait_room table that stores users that joined wait room
CREATE TABLE waiting_room
(
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   TEXT      NOT NULL UNIQUE REFERENCES user (id),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Creat check_next_move_by trigger to ensures that the next_move_by field in the game_board table
-- is either player_1 or player_2 in the corresponding game table, preventing any other user from making a move.
CREATE TRIGGER check_next_move_by
    BEFORE INSERT
    ON game_board
    FOR EACH ROW
    WHEN (NEW.next_move_by != (SELECT player_1
                               FROM game
                               WHERE id = NEW.game_id) AND NEW.next_move_by != (SELECT player_2
                                                                                FROM game
                                                                                WHERE id = NEW.game_id))
BEGIN
SELECT RAISE(FAIL, 'next_move_by must be either player_1 or player_2');
END;


-- Create check_last_move_by trigger to ensure that the last_move_by field in the game_board table is either
-- player_1 or player_2 in the corresponding game table, or NULL (indicating that no moves have been made yet).
-- This prevents any other user from being recorded as having made a move.
CREATE TRIGGER check_last_move_by
    BEFORE INSERT
    ON game_board
    FOR EACH ROW
    WHEN (NEW.last_move_by IS NOT NULL AND NEW.last_move_by != (SELECT player_1
                                                                FROM game
                                                                WHERE id = NEW.game_id) AND
          NEW.last_move_by != (SELECT player_2
                               FROM game
                               WHERE id = NEW.game_id))
BEGIN
SELECT RAISE(FAIL, 'last_move_by must be either player_1 or player_2');
END;
