import React, {useEffect} from 'react';
import {Raycaster, Vector2} from "three";

import SceneInit from "../game_scenes/SceneInit";
import TicTacToe from "../game_scenes/TicTacToe";
import MainMenu from "../game_scenes/MainMenu";

const GameScreen = () => {
    useEffect(() => {
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();

        // Initialize main menu
        const menu = new MainMenu();
        scene.scene.add(menu.menuElements);

        // Initialize game
        const game = new TicTacToe();
        // scene.scene.add(game.board);

        // Instances of mouse and raycaster
        const mouse = new Vector2();
        const raycaster = new Raycaster();

        // Variables for game
        let currentScreen = "titleScreen";
        let gameOngoing = false;
        let turnsGone = 0;

        // Event listeners
        window.addEventListener("mousedown", (event) => {
            // Obtain mouse's position
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            if (currentScreen === "titleScreen") {
                // Set up raycaster
                raycaster.setFromCamera(mouse, scene.camera);

                // Obtain list of objects raycaster intersects with
                const intersects = raycaster.intersectObjects(
                    menu.menuModeButtons.children
                );

                // If raycaster intersects with any mode buttons, go to the corresponding screen
                if (intersects.length > 0) {
                    const clickedButtonID = menu.menuModeButtons.children.find((c) => c.uuid === intersects[0].object.uuid).userData.id;
                    if (clickedButtonID === "passAndPlayButton") {
                        scene.scene.children.splice(0, scene.scene.children.length);
                        scene.scene.add(game.board);
                        currentScreen = "passAndPlayGameScreen";
                        gameOngoing = true;
                        // turnsGone = 0;
                    }}
            }

            else if (currentScreen === "passAndPlayGameScreen") {
                // If game is happening, look for raycaster intersections
                // Else wait for next click to restart the game
                if (gameOngoing) {
                    // Set up raycaster
                    raycaster.setFromCamera(mouse, scene.camera);

                    // Obtain list of objects raycaster intersectsTiles with
                    const intersectsTiles = raycaster.intersectObjects(
                        game.hiddenTiles.children
                    );

                    //console.log(intersectsTiles);

                    // If raycaster intersectsTiles with any tiles, identify it by UUID, and delete it
                    if (intersectsTiles.length > 0) {
                        const xOffset = intersectsTiles[0].object.position.x;
                        const yOffset = intersectsTiles[0].object.position.y;
                        game.addMarker(xOffset, yOffset);
                        turnsGone++;

                        gameOngoing = !(game.checkWin() || turnsGone === 9);
                        const index = game.hiddenTiles.children.findIndex(
                            (c) => c.uuid === intersectsTiles[0].object.uuid
                        );
                        game.hiddenTiles.children.splice(index, 1);
                    }

                    // Obtain list of buttons raycaster intersects with
                    const intersectsButtons = raycaster.intersectObjects(
                        game.buttons.children
                    );

                    // If raycaster intersects with any button, do the corresponding action
                    if (intersectsButtons.length > 0) {
                        const clickedButtonID = game.buttons.children.find((c) => c.uuid === intersectsButtons[0].object.uuid).userData.id;

                        if (clickedButtonID === "backToTitleScreenButton") {
                            scene.scene.children.splice(0, scene.scene.children.length);
                            scene.scene.add(menu.menuElements);
                            currentScreen = "titleScreen";

                            gameOngoing = false;
                            turnsGone = 0;
                        }

                         else if (clickedButtonID === "restartGameButton") {
                            game.restartGame();
                            turnsGone = 0;
                            gameOngoing = true;
                        }
                    }
                } else {
                    game.restartGame();
                    turnsGone = 0;
                    gameOngoing = true;
                }
            }

        }, false);

        // Animate board & elements
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
            if (currentScreen === "titleScreen") {
                menu.menuText.children.forEach(scaleUp);
                menu.menuModeButtons.children.forEach(scaleUp);
            }
            else if (currentScreen === "passAndPlayGameScreen") {
                game.boardLines.children.forEach(scaleUp);
                game.crosses.children.forEach(scaleUp);
                game.circles.children.forEach(scaleUp);
                game.winLine.children.forEach(scaleUp);
                game.text.children.forEach(scaleUp);
                game.buttons.children.forEach(scaleUp);
            }

            requestAnimationFrame(animate);
        };
        animate();
    });

    return (
        <div className="Game">
            <canvas id="3jsCanvas"/>
        </div>
    );
};

export default GameScreen;