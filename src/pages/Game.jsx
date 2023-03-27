import React, { useEffect } from 'react';

import SceneInit from "../components/SceneInit";
import TicTacToe from "../components/TicTacToe";

const Game = () => {
    useEffect(() => {
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();
    }, []);

    return (
        <div className="Game">
            <canvas id="3jsCanvas" />
        </div>
    );
};

export default Game;