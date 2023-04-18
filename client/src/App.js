import {io} from "socket.io-client";
import React, {useEffect, useState} from "react";
import SceneInit from "./game_scenes/SceneInit";
import {Raycaster, Vector2} from "three";
import Cookies from "js-cookie";
import screen_MainMenu from "./resources/screens/screen_MainMenu";
import screen_InGameScreen from "./resources/screens/screen_InGameScreen";

function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    let socket;

    // Web-sockets code
    useEffect(() => {
        // Create websocket/connect
        socket = io();

        // listen for login response
        socket.on("login", (data) => {
            // parse data received from server
            console.log("Login response:", data);
        });

        // listen for registration response
        socket.on("register", (data) => {
            // parse data received from server
            console.log("Registration response:", data);
        });

        // listen for session response
        socket.on("session", (data) => {
            // parse data received from server
            console.log("Session data", data);
        });

        // listen for session response
        socket.on("logout", (data) => {
            // parse data received from server
            console.log("Logout", data);
        });

        return () => {
            // disconnect socket when component unmounts
            socket.disconnect();
        };
    }, [username, password, email]);

    // 3JS Code
    useEffect(() => {
        console.log("bnkiuyhj")
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();

        // Instances of mouse and raycaster
        const mouse = new Vector2();
        const raycaster = new Raycaster();

        // CURRENT SCREEN
        //  -1 - unknown
        //   0 - title
        //   1 - in-game
        Cookies.set('currentScreen', '1'); // #TODO -1 when done testing

        switch (parseInt(Cookies.get("currentScreen"))) {
            case 0:
                scene.scene.children.splice(0, scene.scene.children.length);
                scene.scene.add(screen_MainMenu());
                break;
            case 1:
                scene.scene.children.splice(0, scene.scene.children.length);
                scene.scene.add(screen_InGameScreen(0));
                break;
            default:
                //  scene.scene.children.splice(0, scene.scene.children.length);
                break;
        }

        const animate = () => {
            const scaleUp = (obj) => {
                if (obj.scale.x < 1) {
                    obj.scale.x += 0.04;
                }
                if (obj.scale.y < 1) {
                    obj.scale.y += 0.04;
                }
                if (obj.scale.z < 1) {
                    obj.scale.z += 0.04;
                }
            };

            scene.scene.getObjectByName("titleGroup").children.forEach(scaleUp);
            scene.scene.getObjectByName("boardLinesGroup").children.forEach(scaleUp);
            scene.scene.getObjectByName("controlButtonsButtonsGroup").children.forEach(scaleUp);
            scene.scene.getObjectByName("controlButtonsTextGroup").children.forEach(scaleUp);

            requestAnimationFrame(animate);
        };
        animate();
    }, []);

    const handleLogin = () => {
        // send login event to server with username and password
        socket.emit("login", {username, password});
    };

    const handleRegistration = () => {
        // send registration event to server with email, username and password
        socket.emit("register", {email, username, password});
    };

    return (
        <div className="App">
            <canvas id="3jsCanvas"/>
            <div id={"debug"}>
                <h2>Login</h2>
                <input type="text" placeholder="Username" value={username}
                       onChange={(e) => setUsername(e.target.value)}/>
                <input type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)}/>
                <button onClick={handleLogin}>Login</button>

                <h2>Registration</h2>
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="text" placeholder="Username" value={username}
                       onChange={(e) => setUsername(e.target.value)}/>
                <input type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)}/>
                <button onClick={handleRegistration}>Register</button>

                <h2>Other Actions</h2>
                <button onClick={() => socket.emit("logout")}>Log Out</button>
                <button onClick={() => socket.emit("session")}>Session Info</button>
            </div>
        </div>
    );
}

export default App;
