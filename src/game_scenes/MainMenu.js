import * as THREE from "three";

import GameComponents from "../game_components/GameComponents";

/**
 * The MainMenu class represents the Three.js group with all elements for the main menu of the Tic-Tac-Toe game.
 * To use it, create a new instance of the class and add this.menuElements to your scene.
 *
 * @see SceneInit
 */
class MainMenu {
    constructor() {
        // 3JS group for all menu elements
        this.menuElements = new THREE.Group();

        this.menuText = new THREE.Group();
        this.menuModeButtons = new THREE.Group();

        this.menuElements.add(this.menuText);
        this.menuElements.add(this.menuModeButtons);

        this._initializeMenu();
    }

    /**
     * Construct menu elements
     * @private
     */
    _initializeMenu() {
        // Construct the title
        GameComponents.createMeshText("Tic-Tac-Toe", 17, 2, -62, 28, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        // Construct the single player and multi player buttons
        this.menuModeButtons.add(GameComponents.createMeshButton("playOnlineButton", 85, 23, 1, -1, 4, true));
        this.menuModeButtons.add(GameComponents.createMeshButton("passAndPlayButton", 40, 23, 1, -23.5, -24, true));
        this.menuModeButtons.add(GameComponents.createMeshButton("singlePlayerButton", 40, 23, 1, 21.5, -24, true));

        // Construct the title
            GameComponents.createMeshText("© 2023 Andrii Bessarab. All rights reserved.", 2.2, 0.2, -31.5, -48, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

export default MainMenu;
