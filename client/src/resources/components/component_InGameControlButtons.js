import * as THREE from "three";
import mesh_Text from "../meshes/mesh_Text";
import mesh_Button from "../meshes/mesh_Button";

function component_InGameControlButtons(gamemode, xOffset, yOffset) {
    const controlButtons = new THREE.Group();
    const controlButtonsButtons = new THREE.Group();
    const controlButtonsText = new THREE.Group();

    controlButtons.name = "controlButtonsGroup";
    controlButtonsButtons.name = "controlButtonsButtonsGroup";
    controlButtonsText.name = "controlButtonsTextGroup";

    controlButtons.add(controlButtonsButtons);
    controlButtons.add(controlButtonsText);

    // Construct the title
    switch(gamemode) {
        case 0:
            break;
        case 1:
        case 2:
            controlButtonsButtons.add(mesh_Button("mainMenuButton", 20, 6, 1, -15 + xOffset, -43 + yOffset, true));
            controlButtonsButtons.add(mesh_Button("restartGameButton", 20, 6, 1, 15 + xOffset, -43 + yOffset, true));

            mesh_Text("Main Menu", 2.5, 2, 2, -23.75 + xOffset, -44 + yOffset, 0, true)
                .then((textMesh) => {
                    controlButtonsText.add(textMesh);
                })
                .catch((error) => {
                    console.error(error);
                });

            mesh_Text("Restart", 2.5, 2, 2, 9 + xOffset, -44 + yOffset, 0, true)
                .then((textMesh) => {
                    controlButtonsText.add(textMesh);
                })
                .catch((error) => {
                    console.error(error);
                });
            break;
        default:
            console.error(`component_InGameControlButtons ${gamemode} Invalid Gamemode`);
    }


    return controlButtons;
}

export default component_InGameControlButtons;