import * as THREE from "three";

/**
 * Generates a mesh for cross marker in Tic-Tac-Toe game.
 *
 * @param xOffset x position on the canvas
 * @param yOffset y position on the canvas
 * @returns {Group} cross mesh as Three.js group
 */
function mesh_Plus(xOffset, yOffset) {
    // Generate geometry, material, and mesh
    const plusGeometry = new THREE.BoxGeometry(12, 4, 4);
    const plusMaterial = new THREE.MeshNormalMaterial();
    const leftCrossStickMesh = new THREE.Mesh(plusGeometry, plusMaterial);
    const rightCrossStickMesh = new THREE.Mesh(plusGeometry, plusMaterial);
    leftCrossStickMesh.rotation.z = 0;
    rightCrossStickMesh.rotation.z = 90;

    // Combine meshes into a group
    const plus = new THREE.Group();
    plus.add(leftCrossStickMesh);
    plus.add(rightCrossStickMesh);

    // Give group properties
    plus.position.x = xOffset;
    plus.position.y = yOffset;
    plus.scale.x = 0;
    plus.scale.y = 0;
    plus.scale.z = 0;

    return plus;
}

export default mesh_Plus;