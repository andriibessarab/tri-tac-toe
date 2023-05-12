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
            controlButtonsButtons.add(mesh_Button("restartGameButton", 20, 6, 1, -1 + xOffset, -43 + yOffset, true));

            mesh_Text("Leave Game", 2.5, 2, 2, -10.4 + xOffset, -44 + yOffset, 0, true)
                .then((textMesh) => {
                    controlButtonsText.add(textMesh);
                })
                .catch((error) => {
                    console.error(error);
                });
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



    screenComponents.add().createMeshText("Play Online", 11, 2.5, 2, -40, 0, 0, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        // GameComponents.createMeshText("P & P", 10, 2.5, 2, -38.5, -28, true)
        //     .then((textMesh) => {
        //         this.menuText.add(textMesh);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });

        GameComponents.createMeshText(" Pass &\nPlay", 7, 4, 1.3, -39.5, -21.5, 0, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        GameComponents.createMeshText(" Versus\n Computer", 6, 4, 1.3, 2, -22, 0, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        // Construct the single player and multi player buttons
        this.menuModeButtons.add(GameComponents.createMeshButton("playOnlineButton", 85, 23, 1, -1, 4, true));
        this.menuModeButtons.add(GameComponents.createMeshButton("passAndPlayButton", 40, 23, 1, -23.5, -24, true));
        this.menuModeButtons.add(GameComponents.createMeshButton("singlePlayerButton", 40, 23, 1, 21.5, -24, true));

        // Copyright Sing
            GameComponents.createMeshText("© 2023 Andrii Bessarab. All rights reserved.", 2.2, 1, 0.2, -31.5, -48, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });