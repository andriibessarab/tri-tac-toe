import * as THREE from "three";

import GameComponents from "../components/GameComponents";

class TicTacToe {
    constructor() {
        // Change this instead of actual y offsets to keep the ratio
        this._setYOffset = -2;

        // Create 3JS groups
        this.board = new THREE.Group();
        this.boardLines = new THREE.Group();
        this.hiddenTiles = new THREE.Group();
        this.crosses = new THREE.Group();
        this.circles = new THREE.Group();
        this.winLine = new THREE.Group();
        this.text = new THREE.Group();
        this.buttons = new THREE.Group();

        // Add groups to board
        this.board.add(this.boardLines);
        this.board.add(this.hiddenTiles);
        this.board.add(this.crosses);
        this.board.add(this.circles);
        this.board.add(this.winLine);
        this.board.add(this.text);
        this.board.add(this.buttons);

        // Additional data
        this.currentMarker = "o";
        this.boardCopy = [
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
        ];

        this._initializeBoard();
        this._createBoard();
    }

    ////////////////////////////
    //     PUBLIC METHODS     //
    ////////////////////////////

    // Draw marker on board
    addMarker(xOffset, yOffset) {
        // Draw marker depending on whose turn it is, update boardCopy, and mark
        if (this.currentMarker === "x") {
            this.crosses.add(GameComponents.createMeshCross(xOffset, yOffset));
            this._updateBoardCopy(xOffset, yOffset);
            this.currentMarker = "o";
        } else {
            this.circles.add(GameComponents.createMeshCircle(xOffset, yOffset));
            this._updateBoardCopy(xOffset, yOffset);
            this.currentMarker = "x";
        }
    }

    // Check if either marker won
    checkWin() {
        let strike;

        for (let n = 0; n < 3; n++) {
            if (this._checkHorizontalWin(n)) {
                strike = GameComponents.createMeshWinLine(64, 2, 4);
                strike.position.y = this._roundYOffset(n);
                this.winLine.add(strike);
                return true;
            }
            if (this._checkVerticalWin(n)) {
                strike = GameComponents.createMeshWinLine(2, 64, 4);
                strike.position.x = this._roundXOffset(n);
                strike.position.y = this._setYOffset;
                this.winLine.add(strike);
                return true;
            }
        }

        if (this._checkRightLeaningDiagonalWin()) {
            strike = GameComponents.createMeshWinLine(90, 2, 4);
            strike.rotation.z = -Math.PI / 4;
            strike.position.y = this._setYOffset;
            this.winLine.add(strike);
            return true;
        }

        if (this._checkLeftLeaningDiagonalWin()) {
            strike = GameComponents.createMeshWinLine(90, 2, 4);
            strike.rotation.z = Math.PI / 4;
            strike.position.y = this._setYOffset;
            this.winLine.add(strike);
            return true;
        }
        return false
    }

    // Restart game
    restartGame() {
        // Reset board copy
        this.boardCopy = [
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
        ];

        this.currentMarker = "o";

        // Remove all old elements
        this.boardLines.children.splice(0, this.boardLines.children.length);
        this.hiddenTiles.children.splice(0, this.hiddenTiles.children.length);
        this.crosses.children.splice(0, this.crosses.children.length);
        this.circles.children.splice(0, this.circles.children.length);
        this.winLine.children.splice(0, this.winLine.children.length);

        // Generate new elements
        this._createBoard();
    }

    ////////////////////////////
    //      PRIVATE MISC      //
    ////////////////////////////

    /**
     * Construct board elements that will be drawn once and not changed with replays.
     * @private
     */
    _initializeBoard() {
        // Construct the title
        GameComponents.createMeshText("Pass & Play", 10, 1, 2, -36, 41 + this._setYOffset, 2, true)
            .then((textMesh) => {
                this.text.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        GameComponents.createMeshText("Main Menu", 2.5, 2, 2, -23.75, -44 + this._setYOffset, 0, true)
            .then((textMesh) => {
                this.text.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        GameComponents.createMeshText("Restart", 2.5, 2, 2, 9, -44 + this._setYOffset, 0, true)
            .then((textMesh) => {
                this.text.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        this.buttons.add(GameComponents.createMeshButton("backToTitleScreenButton", 20, 6, 1, -15, -45, true));
        this.buttons.add(GameComponents.createMeshButton("restartGameButton", 20, 6, 1, 15, -45, true));

    }

    /**
     * Construct board elements that will be re-drawn after every game.
     * @private
     */
    _createBoard() {
        // Construct board lines
        this.boardLines.add(GameComponents.createMeshBoardLine(64, 4, 4, 0, 12 + this._setYOffset)); // top line
        this.boardLines.add(GameComponents.createMeshBoardLine(64, 4, 4, 0, -12 + this._setYOffset)); // bottom line
        this.boardLines.add(GameComponents.createMeshBoardLine(4, 64, 4, -12, 0 + this._setYOffset)); // left line
        this.boardLines.add(GameComponents.createMeshBoardLine(4, 64, 4, 12, 0 + this._setYOffset)); // right line

        // Construct hidden tiles for ray-casting
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(-24, 24 + this._setYOffset)); // top-left tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(0, 24 + this._setYOffset)); // top-mid tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(24, 24 + this._setYOffset)); // top-right tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(-24, 0 + this._setYOffset)); // mid-left tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(0, 0 + this._setYOffset)); // mid-mid tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(24, 0 + this._setYOffset)); // mid-right tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(-24, -24 + this._setYOffset)); // bottom-left tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(0, -24 + this._setYOffset)); // bottom-mid tile
        this.hiddenTiles.add(GameComponents.createMeshHiddenBoardTile(24, -24 + this._setYOffset)); // bottom-right tile
    }

    // Change xOffset to appropriate offset for column
    _roundXOffset(n) {
        if (n === 0) {
            return -24;
        } else if (n === 1) {
            return 0;
        } else {
            return 24;
        }
    }

    // Change yOffset to appropriate offset for row
    _roundYOffset(n) {
        if (n === 0) {
            return 24 + this._setYOffset;
        } else if (n === 1) {
            return 0 + this._setYOffset;
        } else {
            return -24 + this._setYOffset;
        }
    }

    // Update board array
    _updateBoardCopy(xOffset, yOffset) {
        let i, j;

        // Determine row by offset
        if (xOffset < 0) {
            j = 0;
        } else if (xOffset === 0) {
            j = 1;
        } else {
            j = 2;
        }

        // Determine column bby offset
        if (yOffset < 0 + this._setYOffset) {
            i = 2;
        } else if (yOffset === 0 + this._setYOffset) {
            i = 1;
        } else {
            i = 0;
        }

        if (this.currentMarker === "o") {
            this.boardCopy[i][j] = "o";
        } else {
            this.boardCopy[i][j] = "x";
        }
    }

    ////////////////////////////
    //     WIN CONDITIONS     //
    ////////////////////////////

    // Check for win in horizontal line
    _checkHorizontalWin(i) {
        return (this.boardCopy[i][0] === this.boardCopy[i][1] && this.boardCopy[i][0] === this.boardCopy[i][2]);
    }

    // Check for win in vertical line
    _checkVerticalWin(i) {
        return (this.boardCopy[0][i] === this.boardCopy[1][i] && this.boardCopy[0][i] === this.boardCopy[2][i]);
    }

    // Check for win in right leaning diagonal line
    _checkRightLeaningDiagonalWin() {
        return (this.boardCopy[0][0] === this.boardCopy[1][1] && this.boardCopy[0][0] === this.boardCopy[2][2]);
    }

    // Check for win in left leaning diagonal line
    _checkLeftLeaningDiagonalWin() {
        return (this.boardCopy[0][2] === this.boardCopy[1][1] && this.boardCopy[0][2] === this.boardCopy[2][0]);
    }
}

export default TicTacToe;
