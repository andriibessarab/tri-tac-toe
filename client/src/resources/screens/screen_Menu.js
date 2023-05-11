import mesh_Text from "../meshes/mesh_Text";


import * as THREE from "three";
import mesh_DecorCross from "../meshes/mesh_DecorCross";
import mesh_DecorCircle from "../meshes/mesh_DecorCircle";
import mesh_hiddenButtonTile from "../meshes/mesh_hiddenButtonTile";

function screen_Menu(userLoggedIn) {
    const screenComponents = new THREE.Group();

    const buttonTiles = new THREE.Group();
    const waitRoomElement = new THREE.Group();


    screenComponents.add(buttonTiles);
    screenComponents.add(waitRoomElement);


    screenComponents.name = "screenComponents";
    buttonTiles.name = "buttonTiles";
    waitRoomElement.name = "waitRoom";


    mesh_Text("Tic-Tac-Toe", 10, 2, 2, -35.8, 39, -2, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(31, 10, 1, 0, 11.5, "online-game"));

    mesh_Text("Online Game", 4, 1, 2, -16, 10, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(28, 10, 1, 0, -1.5, "local-game"));

    mesh_Text("Local Game", 4, 1, 2, -14.3, -3, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    buttonTiles.add(mesh_hiddenButtonTile(33, 10, 1, 0, -14.5, "single-player"));

    mesh_Text("Single Player", 4, 1, 2, -16.6, -16, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });

    // buttonTiles.add(mesh_hiddenButtonTile(22, 10, 1, 0, -27.5, "options"));
    //
    // mesh_Text("Options", 4, 1, 2, -10, -29, -1, true)
    //     .then((textMesh) => {
    //         screenComponents.add(textMesh);
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });




    if (userLoggedIn) {
        buttonTiles.add(mesh_hiddenButtonTile(20, 10, 1, 0, -40.5, "log-out"));

        mesh_Text("Log Out", 4, 1, 2, -9, -42, -1, true)
            .then((textMesh) => {
                screenComponents.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
                buttonTiles.add(mesh_hiddenButtonTile(22, 10, 1, 0, -27.5, "register"));

    mesh_Text("Register", 4, 1, 2, -11, -29, -1, true)
        .then((textMesh) => {
            screenComponents.add(textMesh);
        })
        .catch((error) => {
            console.error(error);
        });
        buttonTiles.add(mesh_hiddenButtonTile(15, 10, 1, 0, -40.5, "log-in"));

        mesh_Text("Log In", 4, 1, 2, -7.5, -42, -1, true)
            .then((textMesh) => {
                screenComponents.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    mesh_Text("© Andrii Bessarab 2023", 2, 1, 0.5, -14.5, -52, -0, true)
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

export default screen_Menu;



