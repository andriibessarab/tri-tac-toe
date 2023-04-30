import * as THREE from "three";

/**
 *
 * Generates a mesh for hidden tiles in Tic-Tac-Toe game.
 * Hidden tiles are invisible boxes used for raycasting.
 *
 * @param xOffset x position on the canvas
 * @param yOffset y position on the canvas
 * @param row the row of the tile
 * @param column the column of the tile
 * @returns {Mesh} the hidden board tile mesh
 */
function mesh_HiddenBoardTile(xOffset, yOffset, row, column) {
    const hiddenTileGeometry = new THREE.BoxGeometry(20, 20, 1);
    const hiddenTileMaterial = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.0
    });
    const hiddenTile = new THREE.Mesh(hiddenTileGeometry, hiddenTileMaterial);
    hiddenTile.position.x = xOffset;
    hiddenTile.position.y = yOffset;
    hiddenTile.userData.row = row;
    hiddenTile.userData.col = column;
    return hiddenTile;
}


export default mesh_HiddenBoardTile;
