import mesh_Text from "../meshes/mesh_Text";


import * as THREE from "three";
import mesh_DecorCross from "../meshes/mesh_DecorCross";
import mesh_DecorCircle from "../meshes/mesh_DecorCircle";

function screen_Menu() {
    const screenComponents = new THREE.Group();

    screenComponents.name = "screenComponents";

    mesh_Text("Tic-Tac-Toe", 10, 2, 2, -35.8, 39, -2, false)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("Online Game", 4, 1, 2, -16, 7, -1, false)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("Local Game", 4, 1, 2, -14.3, -6, -1, false)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("Single Player", 4, 1, 2, -16.6, -19, -1, false)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("Options", 4, 1, 2, -11, -32, -1, false)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("Account", 4, 1, 2, -11, -45, -1, false)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    screenComponents.add(mesh_DecorCross(40, 30, -20, 3, 4, 5, false))

    generateRandomCrosses(18);
    generateRandomCircles(18);

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
                (x > -40 && x < 40 && z > -120 && z < 120)
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
            screenComponents.add(circle);
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
                (x > -40 && x < 40 && z > -120 && z < 120)
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
            screenComponents.add(circle);
        }
    }


}

export default screen_Menu;



