import * as THREE from "three";
import mesh_BoardLine from "../meshes/mesh_BoardLine";
import mesh_HiddenBoardTile from "../meshes/mesh_HiddenBoardTile";
import mesh_Text from "../meshes/mesh_Text";

function component_InGameTitle(xOffset, yOffset, screen, gamemode = -1) {
    const title = new THREE.Group();

    title.name = "titleGroup";

    const [fontSize, z, fontHeight, yOffsets, zOffset, setScaleToZeros] = [10, 2, 2, 39, -2, true];

    if (screen === 0) {
        // Construct the title
        //mesh_Text("Tic-Tac-Toe", 17, 2, 2, -62, 28, -4, true)
        mesh_Text("Tic-Tac-Toe", fontSize, z, fontHeight, -40 + xOffset, 39, zOffset, setScaleToZeros)
            .then((textMesh) => {
                title.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    } else if (screen === 1) {
        // Construct the title
        switch(gamemode) {
            case 0:
                mesh_Text("Online Game", fontSize, z, fontHeight, -40 + xOffset, 41 + yOffset, zOffset, setScaleToZeros)
                    .then((textMesh) => {
                        title.add(textMesh);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                break;
            case 1:
                mesh_Text("Local Game", fontSize, z, fontHeight, -36 + xOffset, 41 + yOffset, zOffset, setScaleToZeros)
                    .then((textMesh) => {
                        title.add(textMesh);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                break;
            case 2:
                mesh_Text("AI Game", fontSize, z, fontHeight, -25.7 + xOffset, 41 + yOffset, zOffset, setScaleToZeros)
                    .then((textMesh) => {
                        title.add(textMesh);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                break;
            default:
                console.error(`component_InGameTitle ${gamemode} Invalid Gamemode`);
        }
    }

    return title;
}

export default component_InGameTitle;