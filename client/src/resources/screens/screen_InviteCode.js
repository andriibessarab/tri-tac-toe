import mesh_Text from "../meshes/mesh_Text";


import * as THREE from "three";
import mesh_DecorCross from "../meshes/mesh_DecorCross";
import mesh_DecorCircle from "../meshes/mesh_DecorCircle";

function screen_InviteCode(joinCode) {
    const screenComponents = new THREE.Group();

    const buttonTiles = new THREE.Group();

    const waitRoomElement = new THREE.Group();

    screenComponents.add(buttonTiles);
    screenComponents.add(waitRoomElement);

    screenComponents.name = "screenComponents";
    buttonTiles.name = "buttonTiles";
    waitRoomElement.name = "waitRoom";


    mesh_Text("Invite Code", 10, 2, 2, -35, 39, -2, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text(joinCode[0], 15, 1, 5, -57, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text(joinCode[1], 15, 1, 5, -37, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text(joinCode[2], 15, 1, 5, -17, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text(joinCode[3], 15, 1, 5, 3, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text(joinCode[4], 15, 1, 5, 23, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text(joinCode[5], 15, 1, 5, 43, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    const descText = `Provide the opponent with the code ${joinCode} in order \nfor them to join the game. Once the code is entered \nyou will be automatically redirected to game page.`

    mesh_Text(descText, 2, 1, 0.5, -33, -42, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    const decorMarkers = new THREE.Group();
    screenComponents.add(decorMarkers);
    decorMarkers.name = "decorMarkers";

    generateRandomCrosses(25);
    generateRandomCircles(25);

    return screenComponents;

    function generateRandomCrosses(n) {
        for (let i = 0; i < n; i++) {
            let x, y, z;
            do {
                x = (Math.random() - 0.5) * 300;
                y = (Math.random() - 0.5) * 200;
                z = (Math.random() - 0.5) * 300;
            } while (
                (x > -50 && x < 50 && z > -80 && z < 80) ||
                (x > -40 && x < 40 && z > -120 && z < 150)
                );
            const xOffset = x;
            const yOffset = y;
            const zOffset = z;
            const xRot = (Math.random() - 0.5) * Math.PI * 2;
            const yRot = (Math.random() - 0.5) * Math.PI * 2;
            const zRot = (Math.random() - 0.5) * Math.PI * 2;
            const opacity = Math.random() * 0.5 + 0.5;
            const scale = Math.random() * 1 + 1;

            const circle = mesh_DecorCross(xOffset, yOffset, zOffset, xRot, yRot, zRot, opacity, false);
            circle.scale.set(scale, scale, scale);
            decorMarkers.add(circle);
        }
    }

    function generateRandomCircles(n) {
        for (let i = 0; i < n; i++) {
            let x, y, z;
            do {
                x = (Math.random() - 0.5) * 300;
                y = (Math.random() - 0.5) * 200;
                z = (Math.random() - 0.5) * 300;
            } while (
                (x > -50 && x < 50 && z > -80 && z < 80) ||
                (x > -40 && x < 40 && z > -120 && z < 150)
                );
            const xOffset = x;
            const yOffset = y;
            const zOffset = z;
            const xRot = (Math.random() - 0.5) * Math.PI * 2;
            const yRot = (Math.random() - 0.5) * Math.PI * 2;
            const zRot = (Math.random() - 0.5) * Math.PI * 2;
            const opacity = Math.random() * 0.5 + 0.5;
            const scale = Math.random() * 1 + 1;

            const circle = mesh_DecorCircle(xOffset, yOffset, zOffset, xRot, yRot, zRot, opacity, false);
            circle.scale.set(scale, scale, scale);
            decorMarkers.add(circle);
        }
    }
}

export default screen_InviteCode;



