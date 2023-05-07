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
import screen_OnlineGameSettings from "./resources/screens/screen_OnlineGameSettings";
import {getIntersectInfo, getRaycasterIntersects, setMousePosition} from "./interactionUtils";

export default function App() {
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
        socket.on("create_game_fail", onCreateGameFail);
        socket.on("create_game_success", onCreateGameSuccess);
        // socket.on("join_wait_fail", onJoinWaitFail);
        // socket.on("join_wait_success", onJoinWaitSuccess);
        // socket.on("make_move_success", onMakeMoveSuccess);

        return () => {
            // Disconnect socket events
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("register-success", onRegisterSuccess);
            socket.off("register-fail", onRegisterFailed);
            socket.off("login-success", onLogInSuccess);
            socket.off("login-fail", onLogInFailed);
            socket.off("logout", onLogOut);
            socket.off("create_game_fail", onCreateGameFail);
            socket.off("create_game_success", onCreateGameSuccess);
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
            case "join-online-game":
                scene.scene.add(screen_OnlineGameSettings());
                window.addEventListener("mousedown", handleMouseDownOnlineGameSettingsScreen, false);
                break;
            case "online-game":
                scene.scene.add(screen_inGame(0));
                window.addEventListener("mousedown", handleMouseDownOnlineGameScreen, false);
                break;
            case "single-player":
                scene.scene.add(screen_inGame(2));
                window.addEventListener("mousedown", handleMouseDownSinglePlayerScreen, false);
                console.log("BLLLAHAHAHGHJYGTHNJUYTGBHNJGFGHJKJHGF HELLOs")
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

                <button onClick={() => {
                    socket.emit("test")
                }}>Test
                </button>
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


    function onCreateGameFail(data) {
        const errorCode = data["error_code"];
        const errorMessage = data["error_message"];
        if (errorCode === 401) {
            setScreen("log-in");
        } else {
            alert(errorMessage);
        }
    }

    function onCreateGameSuccess(data) {
        // Store response
        const _joinCode = data["data"]["game"]["join_code"]
        console.log("we joined", _joinCode)
    }


    function onJoinWaitFail(data) {
        const errorCode = data["error_code"];
        const errorMessage = data["error_message"];
        if (errorCode === 401) {
            setScreen("log-in");
        } else {
            alert(errorMessage);
        }
    }


    function onJoinWaitSuccess(data) {
        // Store response
        const _gameId = data["data"]["game"]["game_id"]
        console.log("we joined", _gameId)

        setCurrentGameID(_gameId);

        // Join the game room
        socket.emit("join_game", {
            game_id: _gameId,
        });
    }


    // function onJoinGameFail(data) {
    //     const errorCode = data["error_code"];
    //     const errorMessage = data["error_message"];
    //     alert(errorMessage);
    // }


    // function onJoinGameSuccess(data) {
    //     // Store response data (p.s. using snake case
    //     // to not interfere with globals)
    //     const game_id = data["data"]["game"]["game_id"]
    //     const game_room_id = data["data"]["game"]["game_room_id"];
    //     const player_number = data["data"]["player"]["player_number"];
    //     const player_marker = data["data"]["player"]["player_marker"];
    //     const is_player_turn = data["data"]["player"]["player_turn"]
    //     const opponent_id = data["data"]["opponent"]["opponent_id"];
    //     const opponent_username = data["data"]["opponent"]["opponent_username"];
    //
    //     // Update necessary state variables
    //     setCurrentGameID(game_id);
    //     setCurrentGameRoomID(game_room_id);
    //     setCurrentGamePlayerNumber(player_number);
    //     setCurrentGamePlayerMarker(player_marker);
    //     setCurrentGamePlayerTurn(is_player_turn);
    //     setCurrentGameOpponentId(opponent_id);
    //     setCurrentGameOpponentUsername(opponent_username);
    //     setHasGameOngoing(true);
    //
    //     window.removeEventListener("mousedown", handleMouseDownMenuScreen);
    //     setScreen("online-game");
    // }


    function onMakeMoveSuccess(data) {
        //     // Store response data (p.s. using snake case
        //     // to not interfere with globals)
        const prev_move_player_id = data["data"]["previous_move"]["player_id"]
        const prev_move_player_marker = data["data"]["previous_move"]["player_marker"]
        const prev_move_coord = data["data"]["previous_move"]["move_coordinate"];
        const prev_move_row = prev_move_coord[0];
        const prev_move_col = prev_move_coord[1];
        const next_move_player_id = data["data"]["next_move"]["player_id"];
        const notThisPlayerPrevMove = parseInt(prev_move_player_id) !== parseInt(userId);

        if (notThisPlayerPrevMove) {
            console.log("were inlining")
            // NEXT STEPS ::: FIND TILE WITH THIS ROW AND COLUMN, REMOVE IT, TAKE ITS OFFSET, DRAW IT ON BOARD, FIND WAY TO OBTAIN USER ID

            const hiddenTilesGroup = scene.scene.getObjectByName("hiddenTilesGroup");

            let targetTile;

            hiddenTilesGroup.children.forEach(tile => {
                if (tile.row === prev_move_row && tile.column === prev_move_col) {
                    targetTile = tile;
                }
            });

            if (!targetTile) {
                // TODO - handle if there is not tile(could occur if other user made illegal move on cell where move has already be done)
                return
            }

            const tile_x = targetTile.position.x;
            const tile_y = targetTile.position.y;

            console.log(prev_move_player_marker);

            // Draw other player's turn
            if (prev_move_player_marker === "x") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(tile_x, tile_y));
            } else if (prev_move_player_marker === "o") {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(tile_x, tile_y));
            } else {
                // TODO - handle if invalid mve(in case something wrong was returned from db)
                return
            }

            // Change state variables
            setCurrentGamePlayerTurn(true);
        }
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
        if (screen === "online-game" || screen === "local-game" || screen == "single-player") {
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
        } else if (screen === "choose-difficulty" || screen === "main-menu") {
            try {
                scene.scene.getObjectByName("screenComponents").children.forEach(animateSceneElement);
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


    function handleMouseDownMenuScreen(event) {        console.log("222222s")
        if (isWaitingToJoinGame) {
            return;
        }

        setMousePosition(event, mouse);

        const targetGroupName = "buttonTiles";
        const intersects = getRaycasterIntersects(event, scene, mouse, raycaster, targetGroupName);
        const intersectsLength = intersects.length;

        if (intersectsLength === 0) {
            return;
        }

        const intersect = intersects[0];
        const buttonInfo = getIntersectInfo(scene, intersect, targetGroupName);
        const buttonObject = buttonInfo.object;
        const buttonName = buttonObject.buttonName;

        window.removeEventListener("mousedown", handleMouseDownMenuScreen);
        // eslint-disable-next-line default-case
        switch (buttonName) {
            case "log-out":
                socket.emit("logout");
                break;
            case "single-player":
                setScreen("choose-difficulty");
                break;
            case "online-game":
                setScreen("join-online-game")
                break;
            case "local-game":
                setScreen("local-game")
                break;
        }
    }


    function handleMouseDownOnlineGameSettingsScreen(event) {
        setMousePosition(event, mouse);

        const targetGroupName = "buttonTiles";
        const intersects = getRaycasterIntersects(event, scene, mouse, raycaster, targetGroupName);
        const intersectsLength = intersects.length;

        if (intersectsLength === 0) {
            return;
        }

        const intersect = intersects[0];
        const buttonInfo = getIntersectInfo(scene, intersect, targetGroupName);
        const buttonObject = buttonInfo.object;
        const buttonName = buttonObject.buttonName;

        // eslint-disable-next-line default-case
        switch (buttonName) {
            case "back":
                window.removeEventListener("mousedown", handleMouseDownOnlineGameSettingsScreen);
                setScreen("main-menu");
                break;
            case "create-game":
                window.removeEventListener("mousedown", handleMouseDownOnlineGameSettingsScreen);
                socket.emit("create_game", {});
                break;
            case "join-online-game":
                window.removeEventListener("mousedown", handleMouseDownMenuScreen);
                setScreen("join-online-game")
                break;
        }
    }


    function handleMouseDownChooseDifficultyScreen(event) {
        setMousePosition(event, mouse);

        const targetGroupName = "buttonTiles";
        const intersects = getRaycasterIntersects(event, scene, mouse, raycaster, targetGroupName);
        const intersectsLength = intersects.length;

        if (intersectsLength === 0) {
            return;
        }

        const intersect = intersects[0];
        const buttonInfo = getIntersectInfo(scene, intersect, targetGroupName);
        const buttonObject = buttonInfo.object;
        const buttonName = buttonObject.buttonName;

        // eslint-disable-next-line default-case
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
        window.removeEventListener("mousedown", handleMouseDownChooseDifficultyScreen);
        setScreen("single-player");console.log("bllaaaaah single")
    }


    function handleMouseDownLocalGameScreen(event) {
        if (!localGameOngoing) {
            restartLocalGame();
            localGameOngoing = true;
        }

        setMousePosition(event, mouse);

        const tilesTargetGroupName = "hiddenTilesGroup";
        const tilesIntersects = getRaycasterIntersects(event, scene, mouse, raycaster, tilesTargetGroupName);
        const tilesIntersectsLength = tilesIntersects.length;

        if (tilesIntersectsLength > 0) {
            const tileIntersect = tilesIntersects[0];
            const tileInfo = getIntersectInfo(scene, tileIntersect, tilesTargetGroupName);
            const tileIndex = tileInfo.index;
            const tileObject = tileInfo.object;
            const tilePosition = tileInfo.position;
            const tilePositionX = tilePosition.x;
            const tilePositionY = tilePosition.y;
            const tileRow = tileObject.userData.row;
            const tileCol = tileObject.userData.col;

            // Remove tile from scene
            scene.scene.getObjectByName(tilesTargetGroupName).children.splice(tileIndex, 1);

            updateGameBoardCopy(tileRow, tileCol, localGameMarker);
            localGameTurnsGone++;
            if (checkWin() || localGameTurnsGone === 9) {
                localGameOngoing = false;
            }

            // Draw marker
            if (localGameMarker === "X") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(tilePositionX, tilePositionY));
                localGameMarker = "O";
            } else {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(tilePositionX, tilePositionY));
                localGameMarker = "X";
            }
        }

        const buttonsTargetGroupName = "controlButtonsButtonsGroup";
        const buttonsIntersects = getRaycasterIntersects(event, scene, mouse, raycaster, buttonsTargetGroupName);
        const buttonsIntersectsLength = buttonsIntersects.length;

        if (buttonsIntersectsLength > 0) {
            const buttonIntersect = buttonsIntersects[0];
            const buttonInfo = getIntersectInfo(scene, buttonIntersect, buttonsTargetGroupName);
            const buttonObject = buttonInfo.object;
            const buttonName = buttonObject.userData.id;

            console.log(buttonName)

            // eslint-disable-next-line default-case
            switch (buttonName) {
                case "mainMenuButton":
                    setIsSceneDefined(false);
                    restartLocalGame();
                    window.removeEventListener("mousedown", handleMouseDownLocalGameScreen);
                    setScreen("main-menu");
                    setIsSceneDefined(true);
                    break;
                case "restartGameButton":
                    restartLocalGame();
                    break;
            }
        }
    }


    function handleMouseDownSinglePlayerScreen(event) {
        if (!localGameOngoing) {
            restartLocalGame();
            localGameOngoing = true;
        }

        setMousePosition(event, mouse);

        const tilesTargetGroupName = "hiddenTilesGroup";
        const tilesIntersects = getRaycasterIntersects(event, scene, mouse, raycaster, tilesTargetGroupName);
        const tilesIntersectsLength = tilesIntersects.length;

        if (tilesIntersectsLength > 0) {
            const tileIntersect = tilesIntersects[0];
            const tileInfo = getIntersectInfo(scene, tileIntersect, tilesTargetGroupName);
            const tileIndex = tileInfo.index;
            const tileObject = tileInfo.object;
            const tilePosition = tileInfo.position;
            const tilePositionX = tilePosition.x;
            const tilePositionY = tilePosition.y;
            const tileRow = tileObject.userData.row;
            const tileCol = tileObject.userData.col;

            // Remove tile from scene
            scene.scene.getObjectByName(tilesTargetGroupName).children.splice(tileIndex, 1);

            updateGameBoardCopy(tileRow, tileCol, singlePlayerGameCurrentTurn);

            // Draw marker
            if (localGameMarker === "X") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(tilePositionX, tilePositionY));
                localGameMarker = "O";
            } else {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(tilePositionX, tilePositionY));
                localGameMarker = "X";
            }

                        localGameTurnsGone++;
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
            console.log(localGameTurnsGone)

            // Find the index of the tile with the given row and col
            const movePerformedOnTileWithIndex = scene.scene.getObjectByName(tilesTargetGroupName).children.findIndex(
                (tile) => tile.userData.row === compMoveRow && tile.userData.col === compMoveCol
            );

            // Get the tile at the given index
            const movePerformedOnTile = scene.scene.getObjectByName(tilesTargetGroupName).children[movePerformedOnTileWithIndex];

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
                return;
            }

            singlePlayerGameCurrentTurn = singlePlayerGameCurrentTurn === "X" ? "O" : "X";

            // Remove tile from scene
            scene.scene.getObjectByName("hiddenTilesGroup").children.splice(movePerformedOnTileWithIndex, 1);
        }

        const buttonsTargetGroupName = "controlButtonsButtonsGroup";
        const buttonsIntersects = getRaycasterIntersects(event, scene, mouse, raycaster, buttonsTargetGroupName);
        const buttonsIntersectsLength = buttonsIntersects.length;

        if (buttonsIntersectsLength === 0) {
            return;
        }

        const buttonIntersect = buttonsIntersects[0];
        const buttonInfo = getIntersectInfo(scene, buttonIntersect, buttonsTargetGroupName);
        const buttonObject = buttonInfo.object;
        const buttonName = buttonObject.userData.id;

        console.log(buttonName)

        // eslint-disable-next-line default-case
        switch (buttonName) {
            case "mainMenuButton":
                setIsSceneDefined(false);
                restartLocalGame();
                window.removeEventListener("mousedown", handleMouseDownSinglePlayerScreen);
                setScreen("main-menu");
                setIsSceneDefined(true);
                break;
            case "restartGameButton":
                restartLocalGame();
                break;
        }
    }


    function handleMouseDownOnlineGameScreen(event, marker) {
        setMousePosition(event, mouse);

        const intersectsTiles = getRaycasterIntersects(event, scene, mouse, raycaster, "hiddenTilesGroup");

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
            socket.emit("make_move", {
                move_coordinate: tileCoord,
            });
        }
    }


    function updateGameBoardCopy(i, j, marker) {
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


    function animateOnLaunch() {


        function animateSceneCameraFadeIn() {
            if (scene.scene.camera.position.z > 128) {
                scene.scene.camera.position.z -= 5;
            }

            animateSceneCameraFadeIn();


            requestAnimationFrame(animateSceneCameraFadeIn)
        }
    }
}



