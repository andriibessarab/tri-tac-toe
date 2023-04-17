import * as THREE from "three";

function mesh_Button(buttonID, width, height, depth, xOffset, yOffset, setScaleToZeros = false) {
    const buttonGeometry = new THREE.BoxGeometry(width, height, depth);
    const buttonMaterial = new THREE.MeshNormalMaterial();
    const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);

    buttonMesh.userData.id = buttonID;

    buttonMesh.position.x = xOffset;
    buttonMesh.position.y = yOffset;
    buttonMesh.scale.z = 4;

    if (setScaleToZeros) {
        buttonMesh.scale.x = 0;
        buttonMesh.scale.y = 0;
    }

    return buttonMesh;
}

export default mesh_Button;
