import React, {useEffect} from 'react';
import Cookies from 'js-cookie';
import {Raycaster, Vector2} from "three";

import SceneInit from "../game_scenes/SceneInit";
import TicTacToe from "../game_scenes/TicTacToe";
import MainMenu from "../game_scenes/MainMenu";
import screen_InGameScreen from "../resources/screens/screen_InGameScreen";
import screen_MainMenu from "../resources/screens/screen_MainMenu";

const GameScreen = () => {
    useEffect(() => {
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();

        // Instances of mouse and raycaster
        const mouse = new Vector2();
        const raycaster = new Raycaster();

        // CURRENT PLAYER
        //  -1 - unknown
        //   0 - x marker
        //   1 - o marker
        Cookies.set('currentPlayer', '-1');

        // CURRENT SCREEN
        //  -1 - unknown
        //   0 - title
        //   1 - in-game
        Cookies.set('currentScreen', '0'); // #TODO -1 when done testing

        // CURRENT GAMEMODE
        //  -1 - no game ongoing
        //   0 - P vs P (multi device)
        //   1 - P vs P (single device)
        //   2 - P vs C
        Cookies.set('currentGamemode', '0'); // #TODO -1 when done testing

        // TURNS GONE (in-game)
        //   0 - no turns gone/no game ongoing
        //  +1 - game ongoing
        Cookies.set('turnsGone', '0');

        switch(parseInt(Cookies.get("currentScreen"))) {
            case 0:
                scene.scene.children.splice(0, scene.scene.children.length);
                scene.scene.add(screen_MainMenu());
                break;
            case 1:
                scene.scene.children.splice(0, scene.scene.children.length);
                scene.scene.add(screen_InGameScreen(parseInt(Cookies.get("currentGamemode"))));
                break;
            default:
                //  scene.scene.children.splice(0, scene.scene.children.length);
                break;
        }


        //
        // // Event listeners
        // window.addEventListener("mousedown", (event) => {
        //     // Obtain mouse's position
        //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        //     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        //
        //     if (currentScreen === "titleScreen") {
        //         // Set up raycaster
        //         raycaster.setFromCamera(mouse, scene.camera);
        //
        //         // Obtain list of objects raycaster intersects with
        //         const intersects = raycaster.intersectObjects(
        //             menu.menuModeButtons.children
        //         );
        //
        //         // If raycaster intersects with any mode buttons, go to the corresponding screen
        //         if (intersects.length > 0) {
        //             const clickedButtonID = menu.menuModeButtons.children.find((c) => c.uuid === intersects[0].object.uuid).userData.id;
        //             if (clickedButtonID === "passAndPlayButton") {
        //                 scene.scene.children.splice(0, scene.scene.children.length);
        //                 scene.scene.add(game.board);
        //                 currentScreen = "passAndPlayGameScreen";
        //                 gameOngoing = true;
        //                 // turnsGone = 0;
        //             }}
        //     }
        //
        //     else if (currentScreen === "passAndPlayGameScreen") {
        //         // If game is happening, look for raycaster intersections
        //         // Else wait for next click to restart the game
        //         if (gameOngoing) {
        //             // Set up raycaster
        //             raycaster.setFromCamera(mouse, scene.camera);
        //
        //             // Obtain list of objects raycaster intersectsTiles with
        //             const intersectsTiles = raycaster.intersectObjects(
        //                 game.hiddenTiles.children
        //             );
        //
        //             //console.log(intersectsTiles);
        //
        //             // If raycaster intersectsTiles with any tiles, identify it by UUID, and delete it
        //             if (intersectsTiles.length > 0) {
        //                 const xOffset = intersectsTiles[0].object.position.x;
        //                 const yOffset = intersectsTiles[0].object.position.y;
        //                 game.addMarker(xOffset, yOffset);
        //                 turnsGone++;
        //
        //                 gameOngoing = !(game.checkWin() || turnsGone === 9);
        //                 const index = game.hiddenTiles.children.findIndex(
        //                     (c) => c.uuid === intersectsTiles[0].object.uuid
        //                 );
        //                 game.hiddenTiles.children.splice(index, 1);
        //             }
        //
        //             // Obtain list of buttons raycaster intersects with
        //             const intersectsButtons = raycaster.intersectObjects(
        //                 game.buttons.children
        //             );
        //
        //             // If raycaster intersects with any button, do the corresponding action
        //             if (intersectsButtons.length > 0) {
        //                 const clickedButtonID = game.buttons.children.find((c) => c.uuid === intersectsButtons[0].object.uuid).userData.id;
        //
        //                 if (clickedButtonID === "backToTitleScreenButton") {
        //                     scene.scene.children.splice(0, scene.scene.children.length);
        //                     scene.scene.add(menu.menuElements);
        //                     currentScreen = "titleScreen";
        //
        //                     gameOngoing = false;
        //                     turnsGone = 0;
        //                 }
        //
        //                  else if (clickedButtonID === "restartGameButton") {
        //                     game.restartGame();
        //                     turnsGone = 0;
        //                     gameOngoing = true;
        //                 }
        //             }
        //         } else {
        //             game.restartGame();
        //             turnsGone = 0;
        //             gameOngoing = true;
        //         }
        //     }
        //
        // }, false);
        //
        // Animate elements
        const animate = () => {
            const scaleUp = (obj) => {
                if (obj.scale.x < 1) {
                    obj.scale.x += 0.04;
                }
                if (obj.scale.y < 1) {
                    obj.scale.y += 0.04;
                }
                if (obj.scale.z < 1) {
                    obj.scale.z += 0.04;
                }
            };

            // Animation for scaling up an element
            // if (currentScreen === "titleScreen") {
            //     menu.menuText.children.forEach(scaleUp);
            //     menu.menuModeButtons.children.forEach(scaleUp);
            // }
            scene.scene.getObjectByName("titleGroup").children.forEach(scaleUp);
            if (parseInt(Cookies.get("currentScreen")) === 1) {
                scene.scene.getObjectByName("boardLinesGroup").children.forEach(scaleUp);
                scene.scene.getObjectByName("controlButtonsButtonsGroup").children.forEach(scaleUp);
                scene.scene.getObjectByName("controlButtonsTextGroup").children.forEach(scaleUp);

                // game.boardLines.children.forEach(scaleUp);
                // game.crosses.children.forEach(scaleUp);
                // game.circles.children.forEach(scaleUp);
                // game.winLine.children.forEach(scaleUp);
                // game.text.children.forEach(scaleUp);
                // game.buttons.children.forEach(scaleUp);                // game.boardLines.children.forEach(scaleUp);
                // game.crosses.children.forEach(scaleUp);
                // game.circles.children.forEach(scaleUp);
                // game.winLine.children.forEach(scaleUp);
                // game.text.children.forEach(scaleUp);
                // game.buttons.children.forEach(scaleUp);
            }

            requestAnimationFrame(animate);
        };
        animate();
    }, []);

    return (
        <div className="Game">
            <canvas id="3jsCanvas"/>
        </div>
    );
};

export default GameScreen;