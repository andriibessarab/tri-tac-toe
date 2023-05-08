import React, {useEffect, useState} from "react";
import socket from "./socket";
import Scene from "./game_scenes/Scene";
import {Raycaster, Vector2} from "three";
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
import screen_InviteCode from "./resources/screens/screen_InviteCode";
import screen_PostGameScreen from "./resources/screens/screen_PostGameScreen";
import screen_MainMenu from "./resources/screens/screen_LogInScreen";
import screen_Menu from "./resources/screens/screen_Menu";

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

    // Forms states
    const [formUserName, setFormUserName] = useState("");
    const [formUserEmail, setFormUserEmail] = useState("");
    const [formUserPassword, setFormUserPassword] = useState("");
    const [formJoinCode, setFormJoinCode] = useState("");

    // Game state variables
    const [currentGamePlayerTurn, setCurrentGamePlayerTurn] = useState(null);
    const [currentGamePlayerMarker, setCurrentGamePlayerMarker] = useState(null);
    const [currentGameOpponentMarker, setCurrentGameOpponentMarker] = useState(null);
    // let currentGamePlayerTurn = null;
    // let currentGamePlayerMarker = null;
    // let currentGameOpponentMarker = null;

    const [player1Id, setPlayer1Id] = useState(null);
    const [player1Marker, setPlayer1Marker] = useState(null);
    const [player2Id, setPlayer2Id] = useState(null);
    const [player2Marker, setPlayer2Marker] = useState(null);
    const [nextTurnBy, setNextTurnBy] = useState(null);

    const [joinCode, setJoinCode] = useState("000000"); // String to hold the current game's opponent username


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

    const [newMoveMade, setNewMoveMade] = useState(null);
    const [newMoveMadeBy, setNewMoveMadeBy] = useState(null);
    const [newMoveMadeMarker, setNewMoveMadeMarker] = useState(null);

    const [gameWinnerId, setGameWinnerId] = useState(null);
    const [gameWinnerMarker, setGameWinnerMarker] = useState(null);


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
        socket.on("join_game_fail", onJoinGameFail);
        socket.on("game_starts", onOnlineGameStarts);
        socket.on("game_ends", onOnlineGameEnds);
        socket.on("make_move_success", onMakeMoveSuccess);
        socket.on("make_move_fail", onMakeMoveFail)

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
            socket.off("join_game_fail", onJoinGameFail);
            socket.off("game_starts", onOnlineGameStarts);
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
                break;
            case "invite-code":
                scene.scene.add(screen_InviteCode(joinCode));
                //window.addEventListener("mousedown", handleMouseDownSinglePlayerScreen, false);
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
            case "won-online-game":
                scene.scene.add(screen_PostGameScreen("win"));
                window.addEventListener("mousedown", handleMouseDownPostGameScreen, false);
                break;
            case "lost-online-game":
                scene.scene.add(screen_PostGameScreen("lose"));
                window.addEventListener("mousedown", handleMouseDownPostGameScreen, false);
                break;
            case "tie-online-game":
                scene.scene.add(screen_PostGameScreen("tie"));
                window.addEventListener("mousedown", handleMouseDownPostGameScreen, false);
                break;
            default:
                break;
        }
        console.log(screen);
        animate();
    }, [isSceneDefined, scene, screen, userId]);

    useEffect(() => {
        if (newMoveMade === null) {
            return;

        }

        const prev_move_row = newMoveMade[0];
        const prev_move_col = newMoveMade[1];

        const notThisPlayerPrevMove = newMoveMadeBy !== userId;

        if (notThisPlayerPrevMove) {
            // NEXT STEPS ::: FIND TILE WITH THIS ROW AND COLUMN, REMOVE IT, TAKE ITS OFFSET, DRAW IT ON BOARD, FIND WAY TO OBTAIN USER ID

            const hiddenTilesGroup = scene.scene.getObjectByName("hiddenTilesGroup");

            let targetTile;

            hiddenTilesGroup.children.forEach(tile => {
                if (tile.userData.row === prev_move_row && tile.userData.col === prev_move_col) {
                    targetTile = tile;
                }
            });

            console.log("TARGET TILE :::", targetTile);

            if (!targetTile) {
                // TODO - handle if there is not tile(could occur if other user made illegal move on cell where move has already be done)
                return
            }

            const tile_x = targetTile.position.x;
            const tile_y = targetTile.position.y;

            // Draw other player's turn
            if (newMoveMadeMarker === "x") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(tile_x, tile_y));
            } else if (newMoveMadeMarker === "o") {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(tile_x, tile_y));
            } else {
                // TODO - handle if invalid mve(in case something wrong was returned from db)
                return
            }

            window.addEventListener("mousedown", handleMouseDownOnlineGameScreen);
        }


        setNewMoveMade(null);
        setNewMoveMadeBy(null);
        setNewMoveMadeMarker(null);
    }, [newMoveMade]);


    useEffect(() => {
        if (gameWinnerId === null) {
            return;
        }

        if (gameWinnerId === "tie") {
            setScreen("tie-online-game");
            setGameWinnerId(null);
            setGameWinnerMarker(null);
            return;
        }


        const thisPlayerWon = gameWinnerId === userId;

        if (thisPlayerWon) {
            setScreen("won-online-game");
        } else {
            setScreen("lost-online-game");
        }

        setGameWinnerId(null);
        setGameWinnerMarker(null);

        // todo might not need to set marker to null because i want to show wallpaper with the winner's marker
    }, [gameWinnerId]);

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

                <h2>Join Game</h2>
                <input type="text" placeholder="Join Code(6 digit)x" value={formJoinCode}
                       onChange={(e) => setFormJoinCode(e.target.value)}/>
                <button onClick={handleJoinGame}
                        disabled={userId === null || hasGameOngoing || formJoinCode.length !== 6}>Join Game
                </button>

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

    function handleJoinGame() {
        const data = {
            "join_code": formJoinCode,
        }
        // send login event to server with username and password
        socket.emit("join_game", data);
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
        window.removeEventListener("mousedown", handleMouseDownMenuScreen);
        // Set state variable
        setIsSceneDefined(false);
        setUserId(_userId);
        setUserName(_userName);
        setUserEmail(_userEmail);
        setScreen("main-menu");
        setIsSceneDefined(true);
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
        setJoinCode(_joinCode);
        console.log(_joinCode, joinCode)
        setScreen("invite-code");
    }


    function onJoinGameFail(data) {
        const errorCode = data["error_code"];
        const errorMessage = data["error_message"];
        if (errorCode === 401) {
            setScreen("log-in");
        } else {
            alert(errorMessage);
        }
    }


    function onOnlineGameStarts(data) {
        // TODO - handle if any of the values are null or undefined
        const _player1Id = data["data"]["player_1"]["user_id"];
        const _player1Marker = data["data"]["player_1"]["marker"];
        const _player2Id = data["data"]["player_2"]["user_id"];
        const _player2Marker = data["data"]["player_2"]["marker"];
        const _nextTurnBy = data["data"]["next_turn_by"];
        // if(_player1Id === userId) {
        //     setCurrentGamePlayerMarker(_player1Marker);
        //     setCurrentGameOpponentMarker(_player2Marker);
        //     setCurrentGamePlayerTurn(true);  // TODO don't hardcode based on player's number
        // } else {
        //     setCurrentGamePlayerMarker (_player2Marker);
        //     setCurrentGameOpponentMarker(_player1Marker);
        //     setCurrentGamePlayerTurn(false);  // TODO don't hardcode based on player's number
        // }

        setPlayer1Id(_player1Id);
        setPlayer1Marker(_player1Marker);
        setPlayer2Id(_player2Id);
        setPlayer2Marker(_player2Marker);
        setNextTurnBy(_nextTurnBy);
        setScreen("online-game");
    }


    function onOnlineGameEnds(data) {
        console.log(data)
        window.removeEventListener("mousedown", handleMouseDownOnlineGameScreen);
        setGameWinnerId(data["data"]["winner"]["id"]);
        setGameWinnerMarker(data["data"]["winner"]["marker"]);
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


    // function onMakeMoveSuccess(data, _userId, _scene) {
    //     useEffect(()=>{
    //
    //     })
    //
    // }


    function onMakeMoveFail(data) {
        const errorCode = data["error_code"];
        const errorMessage = data["error_message"];
        if (errorCode === 401) {
            setScreen("log-in");
        } else {
            alert(errorMessage);
        }
    }


    function onMakeMoveSuccess(data) {
        console.log(userId)
        // Store response data (p.s. using snake case
        // to not interfere with globals)
        const prev_move_player_id = data["data"]["previous_move"]["player_id"]
        const prev_move_player_marker = data["data"]["previous_move"]["player_marker"]
        const prev_move_coord = data["data"]["previous_move"]["move_coordinate"];
        const prev_move_row = prev_move_coord[0];
        const prev_move_col = prev_move_coord[1];
        const next_move_player_id = data["data"]["next_move"]["player_id"];
        setNewMoveMade(prev_move_coord);
        setNewMoveMadeBy(prev_move_player_id);
        setNewMoveMadeMarker(prev_move_player_marker);
        setNextTurnBy(next_move_player_id);

        console.log("NEXT MOVE SHOUL DBE BY", next_move_player_id)
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


    function handleMouseDownMenuScreen(event) {
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


    function handleMouseDownMenuScreen(event) {
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


    function handleMouseDownPostGameScreen(event) {
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
            case "main-menu":
                window.removeEventListener("mousedown", handleMouseDownPostGameScreen);
                setScreen("main-menu");
                break;
            case "play-again":
                window.removeEventListener("mousedown", handleMouseDownPostGameScreen);
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
        setScreen("single-player");
        console.log("bllaaaaah single")
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
                window.removeEventListener("mousedown", handleMouseDownOnlineGameSettingsScreen);
                setScreen("join-online-game")
                break;
        }
    }


    function handleMouseDownOnlineGameScreen(event) {
        console.log(userId, player1Id, player1Marker, player2Id, player2Marker, nextTurnBy)

        if (userId !== nextTurnBy) {
            return;
        }

        setMousePosition(event, mouse);

        const intersectsTiles = getRaycasterIntersects(event, scene, mouse, raycaster, "hiddenTilesGroup");

        // Check if raycaster intersects with any tile
        if (intersectsTiles.length > 0) {
            const xOffset = intersectsTiles[0].object.position.x;
            const yOffset = intersectsTiles[0].object.position.y;

            // Draw marker
            if (userId === player1Id) {
                if (player1Marker === "x") {

                    scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
                } else if (player1Marker === "o") {
                    scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
                }
            } else if (userId === player2Id) {
                if (player2Marker === "x") {

                    scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
                } else if (player2Marker === "o") {
                    scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
                }
            }

            let row, col;

            // Find tile index
            const tileIndex = scene.scene.getObjectByName("hiddenTilesGroup").children.findIndex(
                (c) => c.uuid === intersectsTiles[0].object.uuid
            );

            // Store tile coordinate
            const tile = scene.scene.getObjectByName("hiddenTilesGroup").children[tileIndex];
            const tileRow = tile.userData.row;
            const tileCol = tile.userData.col;
            const tileCoord = [tileRow, tileCol];

            // Remove tile from scene
            scene.scene.getObjectByName("hiddenTilesGroup").children.splice(tileIndex, 1);

            // TODO - make sure player can only place one marker

            // Emit socket for make move
            socket.emit("make_move", {
                move_coordinate: tileCoord,
            });

            window.removeEventListener("mousedown", handleMouseDownOnlineGameScreen);
        }
    }


    function updateGameBoardCopy(i, j, marker) {
        localGameBoardCopy[i][j] = marker;
        singlePlayerGameBoard[i * 3 + j] = "X" ? "X" : "O";
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



