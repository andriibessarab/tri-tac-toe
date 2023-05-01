import React, {useEffect, useState} from "react";
import socket from "./socket";
import Scene from "./game_scenes/Scene";
import {Raycaster, Vector2} from "three";
import screen_Menu from "./resources/screens/screen_Menu";
import screen_inGame from "./resources/screens/screen_InGameScreen";
import screen_LogIn from "./resources/screens/screen_LogIn";
import mesh_Cross from "./resources/meshes/mesh_Cross";
import mesh_Circle from "./resources/meshes/mesh_Circle";
import mesh_HiddenBoardTile from "./resources/meshes/mesh_HiddenBoardTile";
import mesh_WinLine from "./resources/meshes/mesh_WinLine";
import Minimax from 'tic-tac-toe-minimax'
import screen_ChooseDifficulty from "./resources/screens/screen_ChooseDifficulty";

export default function Old() {
    // Constants
    const sceneCanvasName = "3jsCanvas";

    // Local game vars
    let localGameMarker = "X";
    let localGameTurnsGone = 0;
    let localGameOngoing = true;
    let localGameBoardCopy = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
    ];

    let singlePlayerGameCurrentTurn = "X";
    const {ComputerMove} = Minimax;
    let singlePlayerGameHuPlayer = "X";
    let singlePlayerGameAiPlayer = "O";
    let singlePlayerGameSymbols = {
        huPlayer: singlePlayerGameHuPlayer,
        aiPlayer: singlePlayerGameAiPlayer
    }
    let singlePlayerGameDifficulty = "Hard";
    let singlePlayerGameBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // Socket states
    const [isConnected, setIsConnected] = useState(socket.connected);

    // User auth states
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userEmail, setUserEmail] = useState(null);

    // Auth forms states
    const [formUserName, setFormUserName] = useState("");
    const [formUserEmail, setFormUserEmail] = useState("");
    const [formUserPassword, setFormUserPassword] = useState("");

    // Game state variables
    const [currentGameId, setCurrentGameID] = useState(null); // String to hold the current game's ID
    const [currentGameRoomId, setCurrentGameRoomID] = useState(null); // String to hold the current game's room ID
    const [currentGamePlayerNumber, setCurrentGamePlayerNumber] = useState(null); // Number to indicate the current player number (1 or 2)
    const [currentGamePlayerMarker, setCurrentGamePlayerMarker] = useState(null); // String to hold the current player's marker (x or o)
    const [currentGamePlayerTurn, setCurrentGamePlayerTurn] = useState(null); // Number to indicate whether the current player's turn (true or false)
    const [currentGameOpponentId, setCurrentGameOpponentId] = useState(null); // String to hold the current game's opponent ID
    const [currentGameOpponentUsername, setCurrentGameOpponentUsername] = useState(null); // String to hold the current game's opponent username
    const [currentGameBoardCopy, setCurrentGameBoardCopy] = useState([["", "", ""], ["", "", ""], ["", "", ""],]);

    // Scene states
    const [scene, setScene] = useState(null);
    const [screen, setScreen] = useState("main-menu");
    const [mouse, setMouse] = useState(null);
    const [raycaster, setRaycaster] = useState(null);

    // Misc states
    const [isSceneDefined, setIsSceneDefined] = useState(false);
    const [isScreenChanged, setIsScreenChanged] = useState(false);
    const [isWaitingToJoinGame, setIsWaitingToJoinGame] = useState(false); // Boolean to indicate whether the user is waiting to join a game or not
    const [hasGameOngoing, setHasGameOngoing] = useState(false); // Boolean to indicate whether there is an ongoing game or not


    // Init effect
    useEffect(() => {
        // Init scene
        initScene();

        // Init socket events
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("register-success", onRegisterSuccess);
        socket.on("register-fail", onRegisterFailed);
        socket.on("login-success", onLogInSuccess);
        socket.on("login-fail", onLogInFailed);
        socket.on("logout", onLogOut);

        return () => {
            // Disconnect socket events
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("register-success", onRegisterSuccess);
            socket.off("register-fail", onRegisterFailed);
            socket.off("login-success", onLogInSuccess);
            socket.off("login-fail", onLogInFailed);
            socket.off("logout", onLogOut);
        };
    }, []);


    // Update scene screen based on state change
    useEffect(() => {

        if (!isSceneDefined || scene === undefined) {
            console.log("no scene")
            return;
        }

        const sceneElements = scene.scene.children;

        if (!(sceneElements === undefined || sceneElements === null)) {
            scene.scene.children.splice(0, scene.scene.children.length);
        }

        switch (screen) {
            case "main-menu":
                scene.scene.add(screen_Menu(userId !== null));
                window.addEventListener("mousedown", handleMouseDownMenuScreen, false);
                break;
            case "local-game":
                scene.scene.add(screen_inGame(1));
                window.addEventListener("mousedown", handleMouseDownLocalGameScreen, false);
                break;
            case "online-game":
                // scene.scene.add(screen_inGame(0));
                // window.addEventListener("mousedown", handleMouseDownOnlineGameScreen, false);
                break;
            case "single-player":
                scene.scene.add(screen_inGame(2));
                window.addEventListener("mousedown", handleMouseDownSinglePlayerScreen, false);
                break;
            case "log-in":
                scene.scene.add(screen_LogIn());
                break;
            case "register":
                break;
            case "options":
                break;
            case "choose-difficulty":
                scene.scene.add(screen_ChooseDifficulty());
                window.addEventListener("mousedown", handleMouseDownChooseDifficultyScreen, false);
                break;
            default:
                break;
        }
        console.log(screen);
        animate();
    }, [isSceneDefined, scene, screen, userId]);


    return (
        <div className="App">
            <canvas id={sceneCanvasName}/>
            {screen}
            <div id={"debug"}>
                <h2>Login</h2>
                <input type="text" placeholder="Username" value={formUserName}
                       onChange={(e) => setFormUserName(e.target.value)}/>
                <input type="password" placeholder="Password" value={formUserPassword}
                       onChange={(e) => setFormUserPassword(e.target.value)}/>
                <button onClick={handleLogIn}>Login</button>

                <h2>Registration</h2>
                <input type="text" placeholder="Email" value={formUserEmail}
                       onChange={(e) => setFormUserEmail(e.target.value)}/>
                <input type="text" placeholder="Username" value={formUserName}
                       onChange={(e) => setFormUserName(e.target.value)}/>
                <input type="password" placeholder="Password" value={formUserPassword}
                       onChange={(e) => setFormUserPassword(e.target.value)}/>
                <button onClick={handleRegister}>Register</button>
            </div>
        </div>
    );


    function onConnect(data) {
        setIsConnected(true);
        console.log("Server connected.")
    }


    function onDisconnect(data) {
        setIsConnected(false);
    }


    function handleRegister() {
        const data = {
            "username": formUserName,
            "email": formUserEmail,
            "password": formUserPassword // TODO Should be hashed for security reasons
        }
        // send login event to server with username and password
        socket.emit("register", data);
    }


    function onRegisterSuccess(data) {
        console.log("register success")
    }


    function onRegisterFailed(data) {
        const errorCode = data["error_code"];
        const errorMessage = data["error_message"];
        alert(errorMessage);
        console.error(`Error ${errorCode} while joining the game: ${errorMessage}`);
    }


    function handleLogIn() {
        const data = {
            "username": formUserName,
            "password": formUserPassword // TODO Should be hashed for security reasons
        }
        // send login event to server with username and password
        socket.emit("login", data);
    }


    function onLogInSuccess(data) {
        const _userId = data["data"]["user_id"];
        const _userName = data["data"]["username"];
        const _userEmail = data["data"]["email"];

        // Set state variable
        setUserId(_userId);
        setUserName(_userName);
        setUserEmail(_userEmail);

        console.log("login success");
    }


    function onLogInFailed(data) {
        const errorCode = data["error_code"];
        const errorMessage = data["error_message"];
        alert(errorMessage);
        console.error(`Error ${errorCode} while joining the game: ${errorMessage}`);
    }


    function onLogOut(data) {
        setUserId(null);
        setUserName(null);
        setUserEmail(null);
    }


    function initScene() {
        // Initialize scene
        const _scene = new Scene(sceneCanvasName);
        _scene.initScene();
        _scene.animate();

        // Instances of mouse and raycaster
        const _mouse = new Vector2();
        const _raycaster = new Raycaster();

        // Set state variables
        setScene(_scene);
        setMouse(_mouse);
        setRaycaster(_raycaster);
        setIsSceneDefined(true);
    }


    function animate() {
        if (screen === "main-menu") {

        } else if (screen === "online-game" || screen === "local-game" || screen == "single-player") {
            // TODO I don't like using try catch
            try {
                scene.scene.getObjectByName("titleGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("boardLinesGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("controlButtonsButtonsGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("controlButtonsTextGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("crossMarkerGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("circleMarkerGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("winLineGroup").children.forEach(animateSceneElement);
            } catch (err) {
                return
            }


            requestAnimationFrame(animate);
        }

    }


    function animateSceneElement(obj) {
        if (obj.scale.x < 1) {
            obj.scale.x += 0.04;
        }
        if (obj.scale.y < 1) {
            obj.scale.y += 0.04;
        }
        if (obj.scale.z < 1) {
            obj.scale.z += 0.04;
        }
    }


    function handleMouseDownMenuScreen(event) {
        // Obtain mouse's position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Set up raycaster
        raycaster.setFromCamera(mouse, scene.camera);

        // TODO I don't like using try catch
        let intersects;
        try {
            intersects = raycaster.intersectObjects(
                scene.scene.getObjectByName("buttonTiles").children
            );
        } catch (err) {
            return;
        }


        if (intersects.length > 0) {
            const xOffset = intersects[0].object.position.x;
            const yOffset = intersects[0].object.position.y;

            let row, col;

            // Find tile index
            const tileIndex = scene.scene.getObjectByName("buttonTiles").children.findIndex(
                (c) => c.uuid === intersects[0].object.uuid
            );

            // Store tile coordinate
            const tile = scene.scene.getObjectByName("buttonTiles").children[tileIndex];
            const buttonName = tile.buttonName;

            if (buttonName === "log-out") {
                socket.emit("logout")
            } else if (buttonName === "single-player") {
                setScreen("choose-difficulty");
            } else {
                setScreen(buttonName);
            }
            window.removeEventListener("mousedown", handleMouseDownMenuScreen);
        }
    }


    function handleMouseDownChooseDifficultyScreen(event) {
        // Obtain mouse's position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Set up raycaster
        raycaster.setFromCamera(mouse, scene.camera);

        // TODO I don't like using try catch
        let intersects;
        try {
            intersects = raycaster.intersectObjects(
                scene.scene.getObjectByName("buttonTiles").children
            );
        } catch (err) {
            return;
        }


        if (intersects.length > 0) {
            const xOffset = intersects[0].object.position.x;
            const yOffset = intersects[0].object.position.y;

            // Find tile index
            const tileIndex = scene.scene.getObjectByName("buttonTiles").children.findIndex(
                (c) => c.uuid === intersects[0].object.uuid
            );

            // Store tile coordinate
            const tile = scene.scene.getObjectByName("buttonTiles").children[tileIndex];
            const buttonName = tile.buttonName;

            switch (buttonName) {
                case "easy-mode":
                    singlePlayerGameDifficulty = "Easy";
                    break;
                case "normal-mode":
                    singlePlayerGameDifficulty = "Normal";
                    break;
                case "hard-mode":
                    singlePlayerGameDifficulty = "Hard";
                    break;
            }
            setScreen("single-player");
            window.removeEventListener("mousedown", handleMouseDownChooseDifficultyScreen);
        }
    }


    function handleMouseDownLocalGameScreen(event) {
        if (!localGameOngoing) {
            restartLocalGame();
            localGameOngoing = true;
        }

        // Obtain mouse's position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Set up raycaster
        raycaster.setFromCamera(mouse, scene.camera);

        let intersectsTiles;
        try {
            // Obtain list of objects raycaster intersects with
            intersectsTiles = raycaster.intersectObjects(
                scene.scene.getObjectByName("hiddenTilesGroup").children
            );
        } catch (err) {
            return;
        }


        // Check if raycaster intersects with any tile
        if (intersectsTiles.length > 0) {
            const xOffset = intersectsTiles[0].object.position.x;
            const yOffset = intersectsTiles[0].object.position.y;

            // Find tile index
            const tileIndex = scene.scene.getObjectByName("hiddenTilesGroup").children.findIndex(
                (c) => c.uuid === intersectsTiles[0].object.uuid
            );

            // Store tile coordinate
            const tile = scene.scene.getObjectByName("hiddenTilesGroup").children[tileIndex];
            const tileRow = tile.userData.row;
            const tileCol = tile.userData.col;

            // Remove tile from scene
            scene.scene.getObjectByName("hiddenTilesGroup").children.splice(tileIndex, 1);

            updateGameBoardCopy(tileRow, tileCol, localGameMarker);
            localGameTurnsGone++;
            if (checkWin() || localGameTurnsGone === 9) {
                localGameOngoing = false;
            }

            // Draw marker
            if (localGameMarker === "X") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
                localGameMarker = "O";
            } else {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
                localGameMarker = "X";
            }

        }

        let intersectsButtons;

        try {
            intersectsButtons = raycaster.intersectObjects(
                scene.scene.getObjectByName("controlButtonsButtonsGroup").children
            );
        } catch (err) {
            return;
        }


        // If raycaster intersects with any button, do the corresponding action
        if (intersectsButtons.length > 0) {
            const clickedButtonID = scene.scene.getObjectByName("controlButtonsButtonsGroup").children.find((c) => c.uuid === intersectsButtons[0].object.uuid).userData.id;

            if (clickedButtonID === "mainMenuButton") {
                setIsSceneDefined(false);
                restartLocalGame();
                window.removeEventListener("mousedown", handleMouseDownLocalGameScreen);
                setScreen("main-menu");
                setIsSceneDefined(true);
            } else if (clickedButtonID === "restartGameButton") {
                restartLocalGame();
            }
        }
    }


    function handleMouseDownSinglePlayerScreen(event) {
        if (!localGameOngoing) {
            restartLocalGame();
            localGameOngoing = true;
        }

        // Obtain mouse's position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Set up raycaster
        raycaster.setFromCamera(mouse, scene.camera);

        let intersectsTiles;

        // Obtain list of objects raycaster intersects with
        try {
            intersectsTiles = raycaster.intersectObjects(
                scene.scene.getObjectByName("hiddenTilesGroup").children
            );
        } catch (err) {
            return;
        }


        // Check if raycaster intersects with any tile
        if (intersectsTiles.length > 0) {
            const xOffset = intersectsTiles[0].object.position.x;
            const yOffset = intersectsTiles[0].object.position.y;

            // Find tile index
            const tileIndex = scene.scene.getObjectByName("hiddenTilesGroup").children.findIndex(
                (c) => c.uuid === intersectsTiles[0].object.uuid
            );

            // Store tile coordinate
            const tile = scene.scene.getObjectByName("hiddenTilesGroup").children[tileIndex];
            const tileRow = tile.userData.row;
            const tileCol = tile.userData.col;

            // Remove tile from scene
            scene.scene.getObjectByName("hiddenTilesGroup").children.splice(tileIndex, 1);

            updateGameBoardCopy(tileRow, tileCol, singlePlayerGameCurrentTurn);
            localGameTurnsGone++;

            // Draw marker
            if (singlePlayerGameCurrentTurn === "X") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
                localGameMarker = "O";
            } else {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
                localGameMarker = "X";
            }

            if (checkWin() || localGameTurnsGone === 9) {
                localGameOngoing = false;
                return;
            }

            singlePlayerGameCurrentTurn = singlePlayerGameCurrentTurn === "X" ? "O" : "X";

            // Perform computer move
            const computerMove = ComputerMove(singlePlayerGameBoard, singlePlayerGameSymbols, singlePlayerGameDifficulty)

            const compMoveRow = Math.floor(computerMove / 3);
            const compMoveCol = computerMove % 3;

            updateGameBoardCopy(compMoveRow, compMoveCol, singlePlayerGameCurrentTurn);
            localGameTurnsGone++;

            // Find the index of the tile with the given row and col
            const movePerformedOnTileWithIndex = scene.scene.getObjectByName("hiddenTilesGroup").children.findIndex(
                (tile) => tile.userData.row === compMoveRow && tile.userData.col === compMoveCol
            );

            // Get the tile at the given index
            const movePerformedOnTile = scene.scene.getObjectByName("hiddenTilesGroup").children[movePerformedOnTileWithIndex];

            const compMoveX = movePerformedOnTile.position.x;
            const compMoveY = movePerformedOnTile.position.y;

            //Draw marker
            if (singlePlayerGameCurrentTurn === "X") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(compMoveX, compMoveY));
                localGameMarker = "O";
            } else {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(compMoveX, compMoveY));
                localGameMarker = "X";
            }

            if (checkWin() || localGameTurnsGone === 9) {
                localGameOngoing = false;
            }

            singlePlayerGameCurrentTurn = singlePlayerGameCurrentTurn === "X" ? "O" : "X";

            // Remove tile from scene
            scene.scene.getObjectByName("hiddenTilesGroup").children.splice(movePerformedOnTileWithIndex, 1);

        }

        let intersectsButtons;
        try {
            intersectsButtons = raycaster.intersectObjects(
                scene.scene.getObjectByName("controlButtonsButtonsGroup").children
            );
        } catch (err) {
            return;
        }


        // If raycaster intersects with any button, do the corresponding action
        if (intersectsButtons.length > 0) {
            const clickedButtonID = scene.scene.getObjectByName("controlButtonsButtonsGroup").children.find((c) => c.uuid === intersectsButtons[0].object.uuid).userData.id;

            if (clickedButtonID === "mainMenuButton") {
                setIsSceneDefined(false);
                restartLocalGame();
                window.removeEventListener("mousedown", handleMouseDownSinglePlayerScreen);
                setScreen("main-menu");
                setIsSceneDefined(true);
            } else if (clickedButtonID === "restartGameButton") {
                restartLocalGame(); /// TODO
            }
        }
    }


    function handleMouseDownOnlineGameScreen(event, marker) {
        // Obtain mouse's position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Set up raycaster
        raycaster.setFromCamera(mouse, scene.camera);

        // Obtain list of objects raycaster intersects with
        const intersectsTiles = raycaster.intersectObjects(
            scene.scene.getObjectByName("hiddenTilesGroup").children
        );

        // Check if raycaster intersects with any tile
        if (intersectsTiles.length > 0) {
            const xOffset = intersectsTiles[0].object.position.x;
            const yOffset = intersectsTiles[0].object.position.y;

            // Draw marker
            if (marker === "X") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
            } else {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
            }

            let row, col;

            // Find tile index
            const tileIndex = scene.scene.getObjectByName("hiddenTilesGroup").children.findIndex(
                (c) => c.uuid === intersectsTiles[0].object.uuid
            );

            // Store tile coordinate
            const tile = scene.scene.getObjectByName("hiddenTilesGroup").children[tileIndex];
            const tileRow = tile.row;
            const tileCol = tile.column;
            const tileCoord = [tileRow, tileCol];

            // Remove tile from scene
            scene.scene.getObjectByName("hiddenTilesGroup").children.splice(tileIndex, 1);

            // TODO - make sure player can only place one marker

            // Emit socket for make move
            socket.emit("make-move", {
                move_coordinate: tileCoord,
            });
        }
    }


    function updateGameBoardCopy(i, j, marker) {
        console.log("in update baord", i, j)
        localGameBoardCopy[i][j] = marker;
        singlePlayerGameBoard[i * 3 + j] = "X" ? "X" : "O";
        console.table(localGameBoardCopy);
    }


    function restartLocalGame() {
        localGameOngoing = true;
        localGameMarker = "X";
        localGameTurnsGone = 0;
        localGameBoardCopy = [
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
        ];

        singlePlayerGameCurrentTurn = "X";
        singlePlayerGameHuPlayer = "X";
        singlePlayerGameAiPlayer = "O";
        singlePlayerGameSymbols = {
            huPlayer: singlePlayerGameHuPlayer,
            aiPlayer: singlePlayerGameAiPlayer
        }
        singlePlayerGameDifficulty = "Hard";
        singlePlayerGameBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

        // Remove all old elements
        scene.scene.getObjectByName("hiddenTilesGroup").children.splice(0, scene.scene.getObjectByName("hiddenTilesGroup").children.length);
        scene.scene.getObjectByName("crossMarkerGroup").children.splice(0, scene.scene.getObjectByName("crossMarkerGroup").children.length);
        scene.scene.getObjectByName("circleMarkerGroup").children.splice(0, scene.scene.getObjectByName("circleMarkerGroup").children.length);
        scene.scene.getObjectByName("winLineGroup").children.splice(0, scene.scene.getObjectByName("winLineGroup").children.length);

        // TODO should be done in seperate file altogether without repeating the code here
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(-24, 22, 0, 0)); // top-left tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(0, 22, 0, 1)); // top-mid tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(24, 22, 0, 2)); // top-right tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(-24, -2, 1, 0)); // mid-left tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(0, -2, 1, 1)); // mid-mid tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(24, -2, 1, 2)); // mid-right tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(-24, -26, 2, 0)); // bottom-left tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(0, -26, 2, 1)); // bottom-mid tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(24, -26, 2, 2)); // bottom-right tile
    }


    // Check if either marker won
    function checkWin() {
        let strike;
        const board = localGameBoardCopy

        for (let n = 0; n < 3; n++) {
            if (_checkHorizontalWin(n, board)) {
                strike = mesh_WinLine(64, 2, 4);
                strike.position.y = _roundYOffset(n);
                scene.scene.getObjectByName("winLineGroup").add(strike);
                animate();
                return true;
            }
            if (_checkVerticalWin(n, board)) {
                strike = mesh_WinLine(2, 64, 4);
                strike.position.x = _roundXOffset(n);
                strike.position.y = -2;
                scene.scene.getObjectByName("winLineGroup").add(strike);
                animate();
                return true;
            }
        }

        if (_checkRightLeaningDiagonalWin(board)) {
            strike = mesh_WinLine(90, 2, 4);
            strike.rotation.z = -Math.PI / 4;
            strike.position.y = -2;
            scene.scene.getObjectByName("winLineGroup").add(strike);
            animate();
            return true;
        }

        if (_checkLeftLeaningDiagonalWin(board)) {
            strike = mesh_WinLine(90, 2, 4);
            strike.rotation.z = Math.PI / 4;
            strike.position.y = -2
            scene.scene.getObjectByName("winLineGroup").add(strike);
            animate();
            return true;
        }
        return false
    }


    // Check for win in horizontal line
    function _checkHorizontalWin(i, board) {
        return (board[i][0] === board[i][1] && board[i][0] === board[i][2]);
    }


    // Check for win in vertical line
    function _checkVerticalWin(i, board) {
        return (board[0][i] === board[1][i] && board[0][i] === board[2][i]);
    }


    // Check for win in right leaning diagonal line
    function _checkRightLeaningDiagonalWin(board) {
        return (board[0][0] === board[1][1] && board[0][0] === board[2][2]);
    }


    // Check for win in left leaning diagonal line
    function _checkLeftLeaningDiagonalWin(board) {
        return (board[0][2] === board[1][1] && board[0][2] === board[2][0]);
    }


    // Change xOffset to appropriate offset for column
    function _roundXOffset(n) {
        if (n === 0) {
            return -24;
        } else if (n === 1) {
            return 0;
        } else {
            return 24;
        }
    }


    // Change yOffset to appropriate offset for row
    function _roundYOffset(n) {
        if (n === 0) {
            return 22;
        } else if (n === 1) {
            return -2;
        } else {
            return -26;
        }
    }
}



