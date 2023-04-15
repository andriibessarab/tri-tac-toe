import * as THREE from "three";

import GameComponents from "../components/GameComponents";

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
        GameComponents.createMeshText("Tic-Tac-Toe", 17, 2, 2, -62, 28, -4, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        GameComponents.createMeshText("Play Online", 11, 2.5, 2, -40, 0, 0, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        // GameComponents.createMeshText("P & P", 10, 2.5, 2, -38.5, -28, true)
        //     .then((textMesh) => {
        //         this.menuText.add(textMesh);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });

        GameComponents.createMeshText(" Pass &\nPlay", 7, 4, 1.3, -39.5, -21.5, 0, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });

        GameComponents.createMeshText(" Versus\n Computer", 6, 4, 1.3, 2, -22, 0, true)
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

        // Copyright Sing
            GameComponents.createMeshText("© 2023 Andrii Bessarab. All rights reserved.", 2.2, 1, 0.2, -31.5, -48, true)
            .then((textMesh) => {
                this.menuText.add(textMesh);
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

export default MainMenu;
