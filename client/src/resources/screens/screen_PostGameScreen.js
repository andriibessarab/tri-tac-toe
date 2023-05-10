import mesh_Text from "../meshes/mesh_Text";


import * as THREE from "three";
import mesh_DecorCross from "../meshes/mesh_DecorCross";
import mesh_DecorCircle from "../meshes/mesh_DecorCircle";
import mesh_hiddenButtonTile from "../meshes/mesh_hiddenButtonTile";

function screen_PostGameScreen(gameStatus = "win", userMarker = "x") {
    const screenComponents = new THREE.Group();

    const buttonTiles = new THREE.Group();

    screenComponents.add(buttonTiles);

    screenComponents.name = "screenComponents";
    buttonTiles.name = "buttonTiles";

    if (gameStatus === "win") {
        mesh_Text("Victory is yours!", 10, 2, 2, -50, 39, -2, true)
            .then((textMesh) => {
                screenComponents.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    } else if (gameStatus === "lose") {
        mesh_Text("Maybe next time :(", 10, 2, 2, -57, 39, -2, true)
            .then((textMesh) => {
                screenComponents.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        mesh_Text("Looks like it's a tie :0", 10, 2, 2, -65, 39, -2, true)
            .then((textMesh) => {
                screenComponents.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    buttonTiles.add(mesh_hiddenButtonTile(37, 8, 1, 0, 2, "play-again"));

    mesh_Text("Play Again", 5.5, 1, 2, -18, 0, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(28, 8, 1, 0, -48.7, "main-menu"));

    mesh_Text("Main Menu", 4, 1, 2, -13.5, -50, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });


        const decorMarkers = new THREE.Group();
    screenComponents.add(decorMarkers);
    decorMarkers.name = "decorMarkers";

    if (userMarker === "x") {
        generateRandomCrosses(70);
    } else {
        generateRandomCircles(70);
    }

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

export default screen_PostGameScreen;



