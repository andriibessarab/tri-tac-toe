import * as THREE from "three";

/**
 * Create a mesh for board line in Tic-Tac-Toe game.
 *
 * @param x x-axis stretch of line
 * @param y y-axis stretch of line
 * @param z z-axis stretch of line
 * @param xOffset x position on the canvas
 * @param yOffset y position on the canvas
 * @returns {Mesh}
 */
function createMeshBoardLine(x, y, z, xOffset, yOffset) {
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

export default createMeshBoardLine;