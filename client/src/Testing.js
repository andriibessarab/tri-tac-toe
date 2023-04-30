import React, {useEffect, useState} from "react";
import socket from "./socket";
import Scene from "./game_scenes/Scene";
import {Raycaster, Vector2} from "three";
import screen_Menu from "./resources/screens/screen_Menu";
import screen_inGame from "./resources/screens/screen_InGameScreen";

export default function App() {
    // Constants
    const sceneCanvasName = "3jsCanvas";

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

    // Scene states
    const [scene, setScene] = useState(null);
    const [screen, setScreen] = useState("main-menu");
    const [mouse, setMouse] = useState(null);
    const [raycaster, setRaycaster] = useState(null);

    // Misc states
    const [isSceneDefined, setIsSceneDefined] = useState(false);

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
        if (!isSceneDefined) {
            return;
        }

        scene.scene.children.splice(0, scene.scene.children.length);

        switch (screen) {
            case "main-menu":
                scene.scene.add(screen_Menu(userId !== null));
                break;
            case "local-game":
                scene.scene.add(screen_inGame(1));
                break;
            case "online-game":
                scene.scene.add(screen_inGame(2));
                break;
            case "single-player":
                scene.scene.add(screen_inGame(3));
                break;
            case "log-in":
                break;
            case "register":
                break;
            case "options":
                break;
            case "account":
                break;
            default:
                break;
        }
        const animate = () => {
            // scene.scene.getObjectByName("titleGroup").children.forEach(animateSceneElement);
            // scene.scene.getObjectByName("boardLinesGroup").children.forEach(animateSceneElement);
            // scene.scene.getObjectByName("controlButtonsButtonsGroup").children.forEach(animateSceneElement);
            // scene.scene.getObjectByName("controlButtonsTextGroup").children.forEach(animateSceneElement);
            // scene.scene.getObjectByName("crossMarkerGroup").children.forEach(animateSceneElement);
            // scene.scene.getObjectByName("circleMarkerGroup").children.forEach(animateSceneElement);

            requestAnimationFrame(animate);
        }
        animate();
    }, [scene, screen, userId]);


    useEffect(() => {
        // Check if the scene has been defined before adding event listeners
        if (!isSceneDefined) {
            return;
        }

        window.addEventListener("mousedown", (event) => {
            // Obtain mouse's position
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Set up raycaster
            raycaster.setFromCamera(mouse, scene.camera);

            switch (screen) {
                case "main-menu":
                    handleMouseDownMenuScreen();
                    break;
                case "local-game":
                    break;
                case "online-game":
                    break;
                case "single-player":
                    break;
                case "log-in":
                    break;
                case "register":
                    break;
                case "options":
                    break;
                case "account":
                    break;
                default:
                    break;
            }


        }, false);
    }, [isSceneDefined, mouse, raycaster, scene, screen]);


    return (
        <div className="App">
            <canvas id={sceneCanvasName}/>
            {screen}
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

    function handleMouseDownMenuScreen() {
        const intersects = raycaster.intersectObjects(
            scene.scene.getObjectByName("buttonTiles").children
        );

        if (intersects.length > 0) {
            const xOffset = intersects[0].object.position.x;
            const yOffset = intersects[0].object.position.y;
            console.log(scene.scene.getObjectByName("buttonTiles").children)

            let row, col;

            // Find tile index
            const tileIndex = scene.scene.getObjectByName("buttonTiles").children.findIndex(
                (c) => c.uuid === intersects[0].object.uuid
            );

            // Store tile coordinate
            const tile = scene.scene.getObjectByName("buttonTiles").children[tileIndex];
            const buttonName = tile.buttonName;

            setScreen(buttonName);
        }
    }
};


