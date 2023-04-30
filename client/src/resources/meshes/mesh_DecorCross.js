import * as THREE from "three";

/**
 * Generates a mesh for cross marker in Tic-Tac-Toe game.
 *
 * @param xOffset x position on the canvas
 * @param yOffset y position on the canvas
 * @returns {Group} cross mesh as Three.js group
 */
function mesh_Cross(xOffset, yOffset, zOffset, xRot, yRot, zRot, opacity, setScalesToZeros=true) {
    // Generate geometry, material, and mesh
    const crossGeometry = new THREE.BoxGeometry(12, 4, 4);
    const crossMaterial = new THREE.MeshNormalMaterial({
        opacity: opacity,
        transparent: true,
    });
    const leftCrossStickMesh = new THREE.Mesh(crossGeometry, crossMaterial);
    const rightCrossStickMesh = new THREE.Mesh(crossGeometry, crossMaterial);
    leftCrossStickMesh.rotation.z = Math.PI / 4;
    rightCrossStickMesh.rotation.z = -Math.PI / 4;

    // Combine meshes into a group
    const cross = new THREE.Group();
    cross.add(leftCrossStickMesh);
    cross.add(rightCrossStickMesh);

    // Give group properties
    cross.position.x = xOffset;
    cross.position.y = yOffset;
    cross.position.z = zOffset;

    cross.rotation.x = xRot;
    cross.rotation.y = yRot;
    cross.rotation.z = zRot;

    if (setScalesToZeros) {
        cross.scale.x = 0;
        cross.scale.y = 0;
        cross.scale.z = 0;
    }
    return cross;
}

export default mesh_Cross;