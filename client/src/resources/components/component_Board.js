import * as THREE from "three";
import mesh_BoardLine from "../meshes/mesh_BoardLine";
import mesh_HiddenBoardTile from "../meshes/mesh_HiddenBoardTile";

function component_Board(gamemode, xOffset, yOffset) {
    const board = new THREE.Group();
    const boardLines = new THREE.Group();
    const hiddenTiles = new THREE.Group();

    board.name = "boardGroup";
    boardLines.name = "boardLinesGroup";
    hiddenTiles.name = "hiddenTilesGroup";

    board.add(boardLines);
    board.add(hiddenTiles);

    // Construct board lines
    boardLines.add(mesh_BoardLine(64, 4, 4, 0 + xOffset, 12 + yOffset)); // top line
    boardLines.add(mesh_BoardLine(64, 4, 4, 0 + xOffset, -12 + yOffset)); // bottom line
    boardLines.add(mesh_BoardLine(4, 64, 4, -12 + xOffset, 0 + yOffset)); // left line
    boardLines.add(mesh_BoardLine(4, 64, 4, 12 + xOffset, 0 + yOffset)); // right line

    // Construct hidden tiles for ray-casting
    hiddenTiles.add(mesh_HiddenBoardTile(-24 + xOffset, 24 + yOffset)); // top-left tile
    hiddenTiles.add(mesh_HiddenBoardTile(0 + xOffset, 24 + yOffset)); // top-mid tile
    hiddenTiles.add(mesh_HiddenBoardTile(24 + xOffset, 24 + yOffset)); // top-right tile
    hiddenTiles.add(mesh_HiddenBoardTile(-24 + xOffset, 0 + yOffset)); // mid-left tile
    hiddenTiles.add(mesh_HiddenBoardTile(0 + xOffset, 0 + yOffset)); // mid-mid tile
    hiddenTiles.add(mesh_HiddenBoardTile(24 + xOffset, 0 + yOffset)); // mid-right tile
    hiddenTiles.add(mesh_HiddenBoardTile(-24 + xOffset, -24 + yOffset)); // bottom-left tile
    hiddenTiles.add(mesh_HiddenBoardTile(0 + xOffset, -24 + yOffset)); // bottom-mid tile
    hiddenTiles.add(mesh_HiddenBoardTile(24 + xOffset, -24 + yOffset)); // bottom-right tile

    return board;
}

export default component_Board;