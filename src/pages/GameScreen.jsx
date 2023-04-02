import React, {useEffect} from 'react';
import {Raycaster, Vector2} from "three";

import SceneInit from "../game_scenes/SceneInit";
import TicTacToe from "../game_scenes/TicTacToe";

const GameScreen = () => {
    useEffect(() => {
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();

        // Variables for game
        let gameOngoing = true;
        let turnsGone = 0;

        // Initialize game
        const game = new TicTacToe();
        scene.scene.add(game.board);

        // Instances of mouse and raycaster
        const mouse = new Vector2();
        const raycaster = new Raycaster();

        // Event listeners
        window.addEventListener("mousedown", (event) => {
            // If game is happening, look for raycaster intersections
            // Else wait for next click to restart the game
            if (gameOngoing) {
                // Obtain mouse's position
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                // Set up raycaster
                raycaster.setFromCamera(mouse, scene.camera);

                // Obtain list of objects raycaster intersects with
                const intersects = raycaster.intersectObjects(
                    game.hiddenTiles.children
                );

                // If raycaster intersects with any tiles, identify it by UUID, and delete it
                if (intersects.length > 0) {
                    const xOffset = intersects[0].object.position.x;
                    const yOffset = intersects[0].object.position.y;
                    game.addMarker(xOffset, yOffset);
                    turnsGone++;

                    gameOngoing = !(game.checkWin() || turnsGone === 9);
                    const index = game.hiddenTiles.children.findIndex(
                        (c) => c.uuid === intersects[0].object.uuid
                    );
                    game.hiddenTiles.children.splice(index, 1);
                }
            } else {
                game.restartGame();
                turnsGone = 0;
                gameOngoing = true;
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
            game.boardLines.children.forEach(scaleUp);
            game.crosses.children.forEach(scaleUp);
            game.circles.children.forEach(scaleUp);
            game.winLine.children.forEach(scaleUp);
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