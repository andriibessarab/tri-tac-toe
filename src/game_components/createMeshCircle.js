// Circle marker
import * as THREE from "three";

/**
 * Generates a mesh for cross marker in Tic-Tac-Toe game.
 *
 * @param xOffset x position on the canvas
 * @param yOffset y position on the canvas
 * @returns {Mesh} circle mesh
 */
function createMeshCircle(xOffset, yOffset) {
    // Generate geometry, material, and mesh
    const circleGeometry = new THREE.CylinderGeometry(6, 6, 4, 100);
    const circleMaterial = new THREE.MeshNormalMaterial();
    const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);

    // Give mesh properties
    circleMesh.position.x = xOffset;
    circleMesh.position.y = yOffset;
    circleMesh.rotation.x = Math.PI / 2;
    circleMesh.scale.x = 0;
    circleMesh.scale.y = 0;
    circleMesh.scale.z = 0;

    return circleMesh;
}

export default createMeshCircle;