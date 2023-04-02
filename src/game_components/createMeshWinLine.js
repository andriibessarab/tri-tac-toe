import * as THREE from "three";

/**
 * Generate mesh for win line in Tic-Tac-Toe game.
 *
 * @param x x-axis stretch of line
 * @param y y-axis stretch of line
 * @param z z-axis stretch of line
 * @returns {Mesh} win line mesh
 */
function createMeshWinLine(x, y, z) {
    const strikeGeometry = new THREE.BoxGeometry(x, y, z);
    const strikeMaterial = new THREE.MeshNormalMaterial();
    const strike = new THREE.Mesh(strikeGeometry, strikeMaterial);
    strike.scale.x = 0;
    strike.scale.y = 0;
    strike.scale.z = 0;
    return strike;
}

export default createMeshWinLine;