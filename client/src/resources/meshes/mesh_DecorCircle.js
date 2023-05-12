import * as THREE from "three";

/**
 * Generates a mesh for cross marker in Tic-Tac-Toe game.
 *
 * @param xOffset x position on the canvas
 * @param yOffset y position on the canvas
 * @returns {Group} cross mesh as Three.js group
 */
function mesh_DecorCircle(xOffset, yOffset, zOffset, xRot, yRot, zRot, opacity, setScalesToZeros=true) {
    // Generate geometry, material, and mesh
    const circleGeometry = new THREE.CylinderGeometry(6, 6, 4, 100);
    const circleMaterial = new THREE.MeshNormalMaterial({
        opacity: opacity,
        transparent: true,
    });
    const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);


    // Give group properties
    circleMesh.position.x = xOffset;
    circleMesh.position.y = yOffset;
    circleMesh.position.z = zOffset;

    circleMesh.rotation.x = xRot;
    circleMesh.rotation.y = yRot;
    circleMesh.rotation.z = zRot;

    if (setScalesToZeros) {
        circleMesh.scale.x = 0;
        circleMesh.scale.y = 0;
        circleMesh.scale.z = 0;
    }
    return circleMesh;
}

export default mesh_DecorCircle;