import mesh_Text from "../meshes/mesh_Text";


import * as THREE from "three";
import mesh_DecorCross from "../meshes/mesh_DecorCross";
import mesh_DecorCircle from "../meshes/mesh_DecorCircle";
import mesh_hiddenButtonTile from "../meshes/mesh_hiddenButtonTile";

function screen_JoinOnlineGame() {
    const screenComponents = new THREE.Group();

    const buttonTiles = new THREE.Group();

    const waitRoomElement = new THREE.Group();

    screenComponents.add(buttonTiles);
    screenComponents.add(waitRoomElement);

    screenComponents.name = "screenComponents";
    buttonTiles.name = "buttonTiles";


    mesh_Text("X", 15, 1, 5, -57, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("+", 15, 1, 5, -57, 8, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("-", 15, 1, 5, -54.5, -20, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(10, 10, 1, -51, 15, "d0-plus"));
    buttonTiles.add(mesh_hiddenButtonTile(10, 6, 1, -51, -14, "d0-minus"));


    mesh_Text("X", 15, 1, 5, -37, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("+", 15, 1, 5, -37, 8, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("-", 15, 1, 5, -34.5, -20, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(10, 10, 1, -31, 15, "d1-plus"));
    buttonTiles.add(mesh_hiddenButtonTile(10, 6, 1, -31, -14, "d1-minus"));

    mesh_Text("X", 15, 1, 5, -17, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("+", 15, 1, 5, -17, 8, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("-", 15, 1, 5, -14.5, -20, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(10, 10, 1, -11, 15, "d2-plus"));
    buttonTiles.add(mesh_hiddenButtonTile(10, 6, 1, -11, -14, "d2-minus"));

    mesh_Text("X", 15, 1, 5, 3, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("+", 15, 1, 5, 3, 8, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("-", 15, 1, 5, 5.5, -20, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(10, 10, 1, 9, 15, "d3-plus"));
    buttonTiles.add(mesh_hiddenButtonTile(10, 6, 1, 9, -14, "d3-minus"));

    mesh_Text("X", 15, 1, 5, 23, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("+", 15, 1, 5, 23, 8, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("-", 15, 1, 5, 25.5, -20, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(10, 10, 1, 29, 15, "d4-plus"));
    buttonTiles.add(mesh_hiddenButtonTile(10, 6, 1, 29, -14, "d4-minus"));

    mesh_Text("X", 15, 1, 5, 43, -7, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("+", 15, 1, 5, 43, 8, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    mesh_Text("-", 15, 1, 5, 45.5, -20, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(10, 10, 1, 49, 15, "d5-plus"));
    buttonTiles.add(mesh_hiddenButtonTile(10, 6, 1, 49, -14, "d5-minus"));

    buttonTiles.add(mesh_hiddenButtonTile(10, 4, 1, 0, -50, "back"));

    mesh_Text("Back", 3, 1, 1.5, -4.4, -51, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    const descText = `Ask the person who invited you to play for an invide\n code. It's a six character code containing digits only.(i.o. XXX)`

    mesh_Text(descText, 2, 1, 0.5, -33, -42, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    generateRandomCrosses(25);
    generateRandomCircles(25);

    const decorMarkers = new THREE.Group();
    screenComponents.add(decorMarkers);
    decorMarkers.name = "decorMarkers";

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

export default screen_JoinOnlineGame;



