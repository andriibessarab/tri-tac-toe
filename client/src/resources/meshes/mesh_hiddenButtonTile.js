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
function mesh_HiddenButtonTile(x, y, z, xOffset, yOffset, buttonName) {
    const hiddenTileGeometry = new THREE.BoxGeometry(x, y, z);
    const hiddenTileMaterial = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
    });
    const hiddenTile = new THREE.Mesh(hiddenTileGeometry, hiddenTileMaterial);
    hiddenTile.position.x = xOffset;
    hiddenTile.position.y = yOffset;
    hiddenTile.buttonName = buttonName;
    return hiddenTile;
}


export default mesh_HiddenButtonTile;
