import * as THREE from "three";

/**
 *
 * Generates a mesh for hidden tiles in Tic-Tac-Toe game.
 * Hidden tiles are invisible boxes used for raycasting.
 *
 * @param xOffset x position on the canvas
 * @param yOffset y position on the canvas
 * @returns {Mesh} hidden tile mesh
 */
function createMeshHiddenBoardTile(xOffset, yOffset) {
    const hiddenTileGeometry = new THREE.BoxGeometry(20, 20, 1);
    const hiddenTileMaterial = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.0});
    const hiddenTile = new THREE.Mesh(hiddenTileGeometry, hiddenTileMaterial);
    hiddenTile.position.x = xOffset;
    hiddenTile.position.y = yOffset;
    return hiddenTile;
}

export default createMeshHiddenBoardTile;
