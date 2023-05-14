export default class Minimax {
    /*Code of Minmax here*/

    minimaxBoard = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];

    HUMAN = -1;
    COMP = +1;

    /* Function to heuristic evaluation of state. */
    evalute(state) {
        let score;

        if (this.gameOver(state, this.COMP)) {
            score = +1;
        } else if (this.gameOver(state, this.HUMAN)) {
            score = -1;
        } else {
            score = 0;
        }

        return score;
    }

    /* This function tests if a specific player wins */
    gameOver(state, player) {
        let win_state = [
            [state[0][0], state[0][1], state[0][2]],
            [state[1][0], state[1][1], state[1][2]],
            [state[2][0], state[2][1], state[2][2]],
            [state[0][0], state[1][0], state[2][0]],
            [state[0][1], state[1][1], state[2][1]],
            [state[0][2], state[1][2], state[2][2]],
            [state[0][0], state[1][1], state[2][2]],
            [state[2][0], state[1][1], state[0][2]],
        ];

        for (let i = 0; i < 8; i++) {
            let line = win_state[i];
            let filled = 0;
            for(let j = 0; j < 3; j++) {
                if (line[j] === player)
                    filled++;
            }
            if(filled === 3)
                return true;
        }
        return false;
    }

    /* This function test if the human or computer wins */
    gameOverAll(state) {
        return this.gameOver(state, this.HUMAN) || this.gameOver(state, this.COMP);
    }

    emptyCells(state) {
        let cells = [];
        for(let x = 0; x < 3; x++) {
            for(let y = 0; y < 3; y++) {
                if(state[x][y] === 0)
                    cells.push([x, y]);
            }
        }

        return cells;
    }

    /* A move is valid if the chosen cell is empty */
    validMove(x, y) {
        let empties = this.emptyCells(this.minimaxBoard);
        try {
            return this.minimaxBoard[x][y] === 0;
        } catch (e) {
            return false;
        }
    }

    /* Set the move on board, if the coordinates are valid */
    setMove(x, y, player) {
        if (this.validMove(x, y)) {
            this.minimaxBoard[x][y] = player;
            return true;
        } else {
            return false;
        }
    }

    /* *** AI function that choice the best move *** */

// Read more on https://github.com/Cledersonbc/tic-tac-toe-minimax/
    minimax(state, depth, player) {
        let best;

        if (player === this.COMP) {
            best = [-1, -1, -1000];
        } else {
            best = [-1, -1, +1000];
        }

        if (depth === 0 || this.gameOverAll(state)) {
            let score = this.evalute(state);
            return [-1, -1, score];
        }

        this.emptyCells(state).forEach(cell => {
            let x = cell[0];
            let y = cell[1];
            state[x][y] = player;
            let score = this.minimax(state, depth - 1, -player);
            state[x][y] = 0;
            score[0] = x;
            score[1] = y;

            if (player === this.COMP) {
                if (score[2] > best[2])
                    best = score;
            } else {
                if (score[2] < best[2])
                    best = score;
            }
        });

        return best;
    }

    /* It calls the minimax function */
    aiTurn() {
        let move;

        move = this.minimax(this.minimaxBoard, this.emptyCells(this.minimaxBoard).length, this.COMP);

        return [move[0], move[1]]
    }
}
