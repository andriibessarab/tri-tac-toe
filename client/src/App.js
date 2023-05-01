import React, {useEffect, useState} from "react";
import socket from "./socket";
import Scene from "./game_scenes/Scene";
import {Raycaster, Vector2} from "three";
import screen_Menu from "./resources/screens/screen_Menu";
import screen_inGame from "./resources/screens/screen_InGameScreen";
import screen_LogIn from "./resources/screens/screen_LogIn";
import mesh_Cross from "./resources/meshes/mesh_Cross";
import mesh_Circle from "./resources/meshes/mesh_Circle";
import component_Board from "./resources/components/component_Board";
import component_RestartGameBoard from "./resources/components/component_RestartGameBoard";
import mesh_Button from "./resources/meshes/mesh_Button";
import mesh_HiddenBoardTile from "./resources/meshes/mesh_HiddenBoardTile";

export default function Old() {
    // Constants
    const sceneCanvasName = "3jsCanvas";

    // Local game vars
    let localGameMarker = "x";
    let localGameTurnsGone = 0;
    let localGameBoardCopy = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];

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
                scene.scene.add(screen_inGame(0));
                window.addEventListener("mousedown", handleMouseDownOnlineGameScreen, false);
                break;
            case "single-player":
                scene.scene.add(screen_inGame(3));
                break;
            case "log-in":
                scene.scene.add(screen_LogIn());
                break;
            case "register":
                break;
            case "options":
                break;
            case "log-":
                break;
            default:
                break;
        }
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

                <h2>Other Actions</h2>
                <button onClick={() => socket.emit("logout")}>Log Out</button>
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
            if (screen === "online-game" || screen === "local-game") {
                scene.scene.getObjectByName("titleGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("boardLinesGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("controlButtonsButtonsGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("controlButtonsTextGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("crossMarkerGroup").children.forEach(animateSceneElement);
                scene.scene.getObjectByName("circleMarkerGroup").children.forEach(animateSceneElement);
            }
            requestAnimationFrame(animate);
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

        const intersects = raycaster.intersectObjects(
            scene.scene.getObjectByName("buttonTiles").children
        );

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

            setScreen(buttonName);
            window.removeEventListener("mousedown", handleMouseDownMenuScreen);
        }
    }


    function handleMouseDownLocalGameScreen(event) {
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

            // Draw marker
            if (localGameMarker === "x") {
                scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
                localGameMarker = "o";
            } else {
                scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
                localGameMarker = "x";
            }

        }

        const intersectsButtons = raycaster.intersectObjects(
            scene.scene.getObjectByName("controlButtonsButtonsGroup").children
        );

        // If raycaster intersects with any button, do the corresponding action
        if (intersectsButtons.length > 0) {
            const clickedButtonID = scene.scene.getObjectByName("controlButtonsButtonsGroup").children.find((c) => c.uuid === intersectsButtons[0].object.uuid).userData.id;

            if (clickedButtonID === "mainMenuButton") {
                console.log("to title")
                setScene("main-menu");
                // gameOngoing = false;
                // turnsGone = 0;
            } else if (clickedButtonID === "restartGameButton") {
                restartLocalGame();
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
            if (marker === "x") {
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
        console.log(i, j)
        localGameBoardCopy[i][j] = marker;
        console.table(localGameBoardCopy)
    }

    function restartLocalGame() {
        localGameMarker = "x";
        localGameTurnsGone = 0;
        localGameBoardCopy = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
        ];

        // Remove all old elements
        scene.scene.getObjectByName("hiddenTilesGroup").children.splice(0, scene.scene.getObjectByName("hiddenTilesGroup").children.length);
        scene.scene.getObjectByName("crossMarkerGroup").children.splice(0, scene.scene.getObjectByName("crossMarkerGroup").children.length);
        scene.scene.getObjectByName("circleMarkerGroup").children.splice(0, scene.scene.getObjectByName("circleMarkerGroup").children.length);

        // TODO should be done in seperate file altogether without repeating the code here
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(-24, 22, 0, 0)); // top-left tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(0, 22, 0, 1)); // top-mid tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(24, 22, 0, 2)); // top-right tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(-24, -2, 1, 0)); // mid-left tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(0, -2, 1, 1)); // mid-mid tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(24 , -2, 1, 2)); // mid-right tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(-24, -26, 2, 0)); // bottom-left tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(0, -26, 2, 1)); // bottom-mid tile
        scene.scene.getObjectByName("hiddenTilesGroup").add(mesh_HiddenBoardTile(24, -26, 2, 2)); // bottom-right tile

        console.log(scene.scene.getObjectByName("hiddenTilesGroup"));
    }
}



