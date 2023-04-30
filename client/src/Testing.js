import React, {useEffect, useState} from "react";
import socket from "./socket";
import SceneInit from "./game_scenes/SceneInit";
import {Raycaster, Vector2} from "three";

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


    return (
        <div className="App">
            <canvas id={sceneCanvasName}/>
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
        const _scene = new SceneInit(sceneCanvasName);
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
};


