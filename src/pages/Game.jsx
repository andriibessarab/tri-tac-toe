import React, {useEffect} from 'react';
import {Raycaster, Vector2} from "three";

import SceneInit from "../components/SceneInit";
import TicTacToe from "../components/TicTacToe";

const Game = () => {
    useEffect(() => {
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();

        // Initialize game
        const game = new TicTacToe();
        scene.scene.add(game.board);

        // Instances of mouse and raycaster
        const mouse = new Vector2();
        const raycaster = new Raycaster();

        // Event listeners
        window.addEventListener("mousedown", (event) => {
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
                game.checkWin();
                const index = game.hiddenTiles.children.findIndex(
                    (c) => c.uuid === intersects[0].object.uuid
                );
                game.hiddenTiles.children.splice(index, 1);
            }
        }, false);

        // Animate board & elements
        const animate = () => {
            // Animation for scaling up an element
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

export default Game;