import {io} from "socket.io-client";
import React, {useEffect, useState} from "react";
import SceneInit from "./game_scenes/SceneInit";
import {Raycaster, Vector2} from "three";
import Cookies from "js-cookie";
import screen_MainMenu from "./resources/screens/screen_MainMenu";
import screen_InGameScreen from "./resources/screens/screen_InGameScreen";
import mesh_Cross from "./resources/meshes/mesh_Cross";
import mesh_Circle from "./resources/meshes/mesh_Circle";

function App() {
    // State variables
    const [socket, setSocket] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isWaitingToJoinGame, setIsWaitingToJoinGame] = useState(false);

    // Game states
    const [currentGameId, setCurrentGameID] = useState(null);
    const [currentGameRoomId, setCurrentGameRoomID] = useState(null);
    const [currentGamePlayerNumber, setCurrentGamePlayerNumber] = useState(null);
    const [currentGamePlayerTurn, setCurrentGamePlayerTurn] = useState(null);
    const [currentGameOpponentId, setCurrentGameOpponentId] = useState(null);
    const [currentGameOpponentUsername, setCurrentGameOpponentUsername] = useState(null);

    // Cookies - #TODO MOVE TO BACKEND
    Cookies.set('currentScreen', '1');
    Cookies.set('currentMarker', 'x');

    // Initialize Websocket
    useEffect(() => {
        // Create websocket/connect
        const newSocket = io();

        // Runs when connection with server established
        newSocket.on("connect", (data) => {
            // parse data received from server
            console.log("Connected to server", data);
        });

        // Runs when connection with server lost
        newSocket.on("disconnect", (data) => {
            // parse data received from server
            console.log("Disconnected from server", data);
        });

        // Save socket to state
        setSocket(newSocket);

        // Disconnect socket when component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Update event listeners when state variables change
    useEffect(() => {
        if (socket) {
            // listen for registration response
            socket.on("register", (data) => {
                // parse data received from server
                console.log("Registration response:", data);
            });

            // Listen for login response
            socket.on("login", (data) => {
                // parse data received from server
                console.log("Login response:", data);
            });

            // Listen for logout response
            socket.on("logout", (data) => {
                // parse data received from server
                console.log("Logout response:", data);
            });

            // Listen for session response
            socket.on("session", (data) => {
                // parse data received from server
                console.log("Session data:", data);
            });

            // Listen for join wait response
            socket.on("join-wait", (res) => {
                setIsWaitingToJoinGame(false);
                if (res["success"]) {
                    setCurrentGameID(res["data"]["game"]["game_id"]);
                    setCurrentGameRoomID(res["data"]["game"]["game_room_id"]);

                    // Join the game room
                    socket.emit("join-game", {
                        game_id: res["data"]["game"]["game_id"],
                        room_id: currentGameRoomId,
                    });
                  } else {
                    console.error(`Error ${res["error_code"]} while joining the game: ${res["error_message"]}`);
                    // #TODO - Handle error
                  }

            });

            // Listen for join game response
            socket.on(`join-game`, (res) => {
                if (!res["success"]) {
                    console.error(`Error ${res["error_code"]} while joining the game: ${res["error_message"]}`);
                    // #TODO - Handle error
                }

                // Update necessary state variables
                // setCurrentGameID(res["data"]["game"]["game_id"]);  // Update just in case were changed
                // setCurrentGameRoomID(res["data"]["game"]["game_room_id"]);  // Update just in case were changed
                setCurrentGamePlayerNumber(res["data"]["player"]["player_number"]);
                setCurrentGamePlayerTurn(res["data"]["player"]["player_turn"]);
                setCurrentGameOpponentId(res["data"]["opponent"]["opponent_id"]);
                setCurrentGameOpponentUsername(res["data"]["opponent"]["opponent_username"])

                // PROGRESS::::::: We receive all data now figure ouyt why state doesnt work and start working on actual game

                console.log(`Started a game[#${res["data"]["game"]["game_id"]}] against ${res["data"]["opponent"]["opponent_username"]}[#${res["data"]["opponent"]["opponent_id"]}]`)
                console.log(`Currently your turn: ${res["data"]["player"]["player_turn"]}`)

            });
        }
    }, [socket]);

    // Event listeners and animation for scene
    useEffect(() => {
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


        // Switch scene contents depending on screen
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

        // Event listeners
        window.addEventListener("mousedown", (event) => {
            // Obtain mouse's position
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Set up raycaster
            raycaster.setFromCamera(mouse, scene.camera);

            // Obtain list of objects raycaster intersectsTiles with
            const intersectsTiles = raycaster.intersectObjects(
                scene.scene.getObjectByName("hiddenTilesGroup").children
            );

            // If raycaster intersectsTiles with any tiles, identify it by UUID, and delete it
            if (intersectsTiles.length > 0) {
                const xOffset = intersectsTiles[0].object.position.x;
                const yOffset = intersectsTiles[0].object.position.y;

                // Draw marker depending on whose turn it is, update boardCopy, and mark


                if (Cookies.get("currentMarker") === "x") {
                    scene.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
                    //this._updateBoardCopy(xOffset, yOffset);
                    Cookies.set('currentMarker', 'o');
                } else {
                    scene.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
                    //this._updateBoardCopy(xOffset, yOffset);
                    Cookies.set('currentMarker', 'x');
                }


                // game.addMarker(xOffset, yOffset);
                // turnsGone++;
                // gameOngoing = !(game.checkWin() || turnsGone === 9);
                const index = scene.scene.getObjectByName("hiddenTilesGroup").children.findIndex(
                    (c) => c.uuid === intersectsTiles[0].object.uuid);
                scene.scene.getObjectByName("hiddenTilesGroup").children.splice(index, 1);
            }

            // // Obtain list of buttons raycaster intersects with
            // const intersectsButtons = raycaster.intersectObjects(
            //     game.buttons.children
            // );
            //
            // // If raycaster intersects with any button, do the corresponding action
            // if (intersectsButtons.length > 0) {
            //     const clickedButtonID = game.buttons.children.find((c) => c.uuid === intersectsButtons[0].object.uuid).userData.id;
            //
            //     if (clickedButtonID === "backToTitleScreenButton") {
            //         scene.scene.children.splice(0, scene.scene.children.length);
            //         scene.scene.add(menu.menuElements);
            //         currentScreen = "titleScreen";
            //
            //         gameOngoing = false;
            //         turnsGone = 0;
            //     }
            //
            //      else if (clickedButtonID === "restartGameButton") {
            //         game.restartGame();
            //         turnsGone = 0;
            //         gameOngoing = true;
            //     }
            // }

        }, false);

        // Animate scene elements
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
            scene.scene.getObjectByName("crossMarkerGroup").children.forEach(scaleUp);
            scene.scene.getObjectByName("circleMarkerGroup").children.forEach(scaleUp);

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

    const handleJoinGame = () => {
        // send registration event to server with email, username and password
        setIsWaitingToJoinGame(true);
        socket.emit("join-wait")

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
                <button onClick={handleJoinGame} disabled={isWaitingToJoinGame}>
                    {isWaitingToJoinGame ? "Waiting for opponent..." : "Play Online"}
                </button>

                <h2>Admin Actions</h2>
                <button onClick={() => socket.emit("clear-redis-db")}>Clear Redis DB</button>
                <button onClick={() => socket.emit("remove-all-groups")}>Remove All Socket Groups</button>
            </div>
        </div>
    );
}

export default App;
