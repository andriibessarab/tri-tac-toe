import * as THREE from "three";
import component_Board from "../components/component_Board";
import component_InGameTitle from "../components/component_InGameTitle";
import component_InGameControlButtons from "../components/component_InGameControlButtons";

function screen_inGame(gamemode) {
    const [xOffset, yOffset] = [0, -2];
    const screenComponents = new THREE.Group();

    // Empty Groups
    const crosses = new THREE.Group();
    const circles = new THREE.Group();
    crosses.name = "crossMarkerGroup";
    circles.name = "circleMarkerGroup";
    screenComponents.add(crosses);
    screenComponents.add(circles);

    screenComponents.name = "screenComponents";

    screenComponents.add(component_InGameTitle(xOffset, yOffset, 1,gamemode));
    screenComponents.add(component_Board(gamemode, xOffset, yOffset));
    screenComponents.add(component_InGameControlButtons(gamemode, xOffset, yOffset));

    return screenComponents;
}

export default screen_inGame;
