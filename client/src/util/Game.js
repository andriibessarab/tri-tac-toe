// import * as THREE from "three";
//
//
// class Game {
//     constructor(scene, startMarker) {
//         // Check if the scene is undefined or null
//         if (!scene) {
//             throw new Error("Scene is undefined");
//         }
//
//         // Check if the start marker is invalid (not "x" or "o")
//         if (startMarker !== "x" && startMarker !== "o") {
//             throw new Error("Invalid start marker: " + startMarker);
//         }
//
//         // Save the scene and marker to instance variables
//         this.scene = scene;
//         this.startMarker = startMarker;
//         this.boardCopy = [
//             ["1", "2", "3"],
//             ["4", "5", "6"],
//             ["7", "8", "9"],
//         ];
//
//         this._initializeBoard();
//         this._createBoard();
//     }
//
//     ////////////////////////////
//     //     PUBLIC METHODS     //
//     ////////////////////////////
//
//     // Draw marker on board
//     addMarker(xOffset, yOffset) {
//         // Draw marker depending on whose turn it is, update boardCopy, and mark
//         if (this.currentMarker === "x") {
//             this.crosses.add(GameComponents.createMeshCross(xOffset, yOffset));
//             this._updateBoardCopy(xOffset, yOffset);
//             this.currentMarker = "o";
//         } else {
//             this.circles.add(GameComponents.createMeshCircle(xOffset, yOffset));
//             this._updateBoardCopy(xOffset, yOffset);
//             this.currentMarker = "x";
//         }
//     }
//
//     // Check if either marker won
//     checkWin() {
//         let strike;
//
//         for (let n = 0; n < 3; n++) {
//             if (this._checkHorizontalWin(n)) {
//                 strike = GameComponents.createMeshWinLine(64, 2, 4);
//                 strike.position.y = this._roundYOffset(n);
//                 this.winLine.add(strike);
//                 return true;
//             }
//             if (this._checkVerticalWin(n)) {
//                 strike = GameComponents.createMeshWinLine(2, 64, 4);
//                 strike.position.x = this._roundXOffset(n);
//                 strike.position.y = this._setYOffset;
//                 this.winLine.add(strike);
//                 return true;
//             }
//         }
//
//         if (this._checkRightLeaningDiagonalWin()) {
//             strike = GameComponents.createMeshWinLine(90, 2, 4);
//             strike.rotation.z = -Math.PI / 4;
//             strike.position.y = this._setYOffset;
//             this.winLine.add(strike);
//             return true;
//         }
//
//         if (this._checkLeftLeaningDiagonalWin()) {
//             strike = GameComponents.createMeshWinLine(90, 2, 4);
//             strike.rotation.z = Math.PI / 4;
//             strike.position.y = this._setYOffset;
//             this.winLine.add(strike);
//             return true;
//         }
//         return false
//     }
//
//     // Restart game
//     restartGame() {
//         // Reset board copy
//         this.boardCopy = [
//             ["1", "2", "3"],
//             ["4", "5", "6"],
//             ["7", "8", "9"],
//         ];
//
//         this.currentMarker = "o";
//
//         // Remove all old elements
//         this.boardLines.children.splice(0, this.boardLines.children.length);
//         this.hiddenTiles.children.splice(0, this.hiddenTiles.children.length);
//         this.crosses.children.splice(0, this.crosses.children.length);
//         this.circles.children.splice(0, this.circles.children.length);
//         this.winLine.children.splice(0, this.winLine.children.length);
//
//         // Generate new elements
//         this._createBoard();
//     }
//
//     ////////////////////////////
//     //      PRIVATE MISC      //
//     ////////////////////////////
//
//     /**
//      * Construct board elements that will be drawn once and not changed with replays.
//      * @private
//      */
//     _initializeBoard() {
//     }
//
//     /**
//      * Construct board elements that will be re-drawn after every game.
//      * @private
//      */
//     _createBoard() {
// }
//
//     // Change xOffset to appropriate offset for column
//     _roundXOffset(n) {
//         if (n === 0) {
//             return -24;
//         } else if (n === 1) {
//             return 0;
//         } else {
//             return 24;
//         }
//     }
//
//     // Change yOffset to appropriate offset for row
//     _roundYOffset(n) {
//         if (n === 0) {
//             return 24 + this._setYOffset;
//         } else if (n === 1) {
//             return 0 + this._setYOffset;
//         } else {
//             return -24 + this._setYOffset;
//         }
//     }
//
//     // Update board array
//     _updateBoardCopy(xOffset, yOffset) {
//         let i, j;
//
//         // Determine row by offset
//         if (xOffset < 0) {
//             j = 0;
//         } else if (xOffset === 0) {
//             j = 1;
//         } else {
//             j = 2;
//         }
//
//         // Determine column bby offset
//         if (yOffset < 0 + this._setYOffset) {
//             i = 2;
//         } else if (yOffset === 0 + this._setYOffset) {
//             i = 1;
//         } else {
//             i = 0;
//         }
//
//         if (this.currentMarker === "o") {
//             this.boardCopy[i][j] = "o";
//         } else {
//             this.boardCopy[i][j] = "x";
//         }
//     }
//
//     ////////////////////////////
//     //     WIN CONDITIONS     //
//     ////////////////////////////
//
//     // Check for win in horizontal line
//     _checkHorizontalWin(i) {
//         return (this.boardCopy[i][0] === this.boardCopy[i][1] && this.boardCopy[i][0] === this.boardCopy[i][2]);
//     }
//
//     // Check for win in vertical line
//     _checkVerticalWin(i) {
//         return (this.boardCopy[0][i] === this.boardCopy[1][i] && this.boardCopy[0][i] === this.boardCopy[2][i]);
//     }
//
//     // Check for win in right leaning diagonal line
//     _checkRightLeaningDiagonalWin() {
//         return (this.boardCopy[0][0] === this.boardCopy[1][1] && this.boardCopy[0][0] === this.boardCopy[2][2]);
//     }
//
//     // Check for win in left leaning diagonal line
//     _checkLeftLeaningDiagonalWin() {
//         return (this.boardCopy[0][2] === this.boardCopy[1][1] && this.boardCopy[0][2] === this.boardCopy[2][0]);
//     }
// }
//
// export default TicTacToe;
