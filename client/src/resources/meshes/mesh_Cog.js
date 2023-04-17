import * as THREE from "three";

/**
 * Create mesh for a cog element.
 *
 * @param xOffset x position on the board
 * @param yOffset y position on the board
 * @returns {Mesh} cog mesh
 */
function mesh_Cog(xOffset, yOffset) {
    // create cog geometry
    //const cogGeometry = new THREE.CylinderGeometry(3, 3, 2, 50);
    const toothGeometry = new THREE.BoxGeometry(0.3, 3.3, 1);

    // create cog material
    const cogMaterial = new THREE.MeshNormalMaterial();

    // create cog mesh
    //const cogMesh = new THREE.Mesh(cogGeometry, cogMaterial);

    // create cog teeth
    const cogTeeth = new THREE.Group();
    for (let i = 0; i < 24; i++) {
        const toothMesh = new THREE.Mesh(toothGeometry, cogMaterial);
        toothMesh.rotation.z = (i * Math.PI) / 12;
        cogTeeth.add(toothMesh);
    }

    // create cog mesh group
    const cogGroup = new THREE.Group();
    //cogGroup.add(cogMesh);
    cogGroup.add(cogTeeth);

    cogGroup.position.x = xOffset;
    cogGroup.position.y = yOffset;

    return cogGroup;
}

export default mesh_Cog;
