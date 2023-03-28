import React, { useEffect } from 'react';
import {Mouth, Raycaster} from "three";

import SceneInit from "../components/SceneInit";
import TicTacToe from "../components/TicTacToe";

const Game = () => {
    useEffect(() => {
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();

        // Initialize game
        const ticTacToe = new TicTacToe();
        scene.scene.add(ticTacToe.board);

        // Scale up element
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

        // Animate board
        const animate = () => {
            ticTacToe.boardLines.children.forEach(scaleUp);
            requestAnimationFrame(animate);
        };


        animate();
    });

    return (
        <div className="Game">
            <canvas id="3jsCanvas" />
        </div>
    );
};

export default Game;