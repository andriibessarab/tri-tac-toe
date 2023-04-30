import * as THREE from "three";
import component_Board from "../components/component_Board";
import component_InGameTitle from "../components/component_InGameTitle";
import component_InGameControlButtons from "../components/component_InGameControlButtons";
import mesh_Text from "../meshes/mesh_Text";

function screen_LogIn() {
    const screenComponents = new THREE.Group();

    screenComponents.name = "screenComponents";

    // Construct the title
    mesh_Text("Tic-Tac-Toe", 12, 0, 4, -40, 39, 0, false)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    return screenComponents;
}

export default screen_LogIn;
