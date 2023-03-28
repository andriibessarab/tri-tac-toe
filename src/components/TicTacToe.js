import * as THREE from "three";

export default class TicTacToe {
    constructor() {
        // Create 3JS groups
        this.board = new THREE.Group();
        this.boardLines = new THREE.Group();
        this.hiddenTiles = new THREE.Group();

        // Add groups to board
        this.board.add(this.boardLines);
        this.board.add(this.hiddenTiles);

        this._createBoard();
    }

    // Construct board
    _createBoard() {
        // Construct board lines
        this.boardLines.add(this._boardLine(64, 4, 4, 0, 12)); // top line
        this.boardLines.add(this._boardLine(64, 4, 4, 0, -12)); // bottom line
        this.boardLines.add(this._boardLine(4, 64, 4, -12, 0)); // left line
        this.boardLines.add(this._boardLine(4, 64, 4, 12, 0)); // right line

        // Construct hidden tiles for ray-casting
        this.hiddenTiles.add(this._hiddenTile(-24, 24)); // top-left tile
        this.hiddenTiles.add(this._hiddenTile(0, 24)); // top-mid tile
        this.hiddenTiles.add(this._hiddenTile(24, 24)); // top-right tile
        this.hiddenTiles.add(this._hiddenTile(-24, 0)); // mid-left tile
        this.hiddenTiles.add(this._hiddenTile(0, 0)); // mid-mid tile
        this.hiddenTiles.add(this._hiddenTile(24, 0)); // mid-right tile
        this.hiddenTiles.add(this._hiddenTile(-24, -24)); // bottom-left tile
        this.hiddenTiles.add(this._hiddenTile(0, -24)); // bottom-mid tile
        this.hiddenTiles.add(this._hiddenTile(24, -24)); // bottom-right tile
    }

    // Construct board line
    _boardLine(x, y, z, xOffset, yOffset) {
        const boardLineGeometry = new THREE.BoxGeometry(x, y, z);
        const boardLineMaterial = new THREE.MeshNormalMaterial();
        const boardLine = new THREE.Mesh(boardLineGeometry, boardLineMaterial);
        boardLine.position.x = xOffset;
        boardLine.position.y = yOffset;
        boardLine.scale.x = 0;
        boardLine.scale.y = 0;
        boardLine.scale.z = 0;
        return boardLine;
    }

    // Create hidden tiles(create hidden mesh for raycasting)
    _hiddenTile(xOffset, yOffset) {
        const hiddenTileGeometry = new THREE.BoxGeometry(12, 12, 1);
        const hiddenTileMaterial = new THREE.MeshNormalMaterial();
        const hiddenTile = new THREE.Mesh(hiddenTileGeometry, hiddenTileMaterial);
        hiddenTile.position.x = xOffset;
        hiddenTile.position.y = yOffset;
        return hiddenTile;
    }

}