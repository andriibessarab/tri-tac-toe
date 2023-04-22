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
    // Scene variables
    const [sceneState, setSceneState] = useState(new SceneInit("3jsCanvas")); // Object to hold the 3JS scene instance

    // Mouse and raycaster variables
    const [mouseState, setMouseState] = useState(null); // Object to hold the current mouse state
    const [raycasterState, setRaycasterState] = useState(null); // Object to hold the current raycaster state

    // Scene screen state variables
    const [sceneScreenState, setSceneScreenState] = useState("in-game"); // State variable to keep track of the current scene screen

    // User authentication variables
    const [socket, setSocket] = useState(null); // Object to hold the socket connection instance
    const [username, setUsername] = useState(""); // String to hold the current user's username
    const [password, setPassword] = useState(""); // String to hold the current user's password
    const [email, setEmail] = useState(""); // String to hold the current user's email address
    const [isWaitingToJoinGame, setIsWaitingToJoinGame] = useState(false); // Boolean to indicate whether the user is waiting to join a game or not

    // Game state variables
    const [hasGameOngoing, setHasGameOngoing] = useState(false); // Boolean to indicate whether there is an ongoing game or not
    const [currentGameId, setCurrentGameID] = useState(null); // String to hold the current game's ID
    const [currentGameRoomId, setCurrentGameRoomID] = useState(null); // String to hold the current game's room ID
    const [currentGamePlayerNumber, setCurrentGamePlayerNumber] = useState(null); // Number to indicate the current player number (1 or 2)
    const [currentGamePlayerMarker, setCurrentGamePlayerMarker] = useState(null); // String to hold the current player's marker (X or O)
    const [currentGamePlayerTurn, setCurrentGamePlayerTurn] = useState(null); // Number to indicate the current player's turn (1 or 2)
    const [currentGameOpponentId, setCurrentGameOpponentId] = useState(null); // String to hold the current game's opponent ID
    const [currentGameOpponentUsername, setCurrentGameOpponentUsername] = useState(null); // String to hold the current game's opponent username

    // Other state variables
    const [isSceneDefined, setIsSceneDefined] = useState(false); // Boolean to indicate whether the scene is defined or not

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

    // Websocket event listeners
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
                // Enable play online button
                setIsWaitingToJoinGame(false);

                // Check if any error occurred
                if (!res["success"]) {
                    console.error(`Error ${res["error_code"]} while joining the game: ${res["error_message"]}`);
                    // #TODO - Handle error
                    return;
                }

                // Store response
                const game_id = res["data"]["game"]["game_id"]

                // Join the game room
                   socket.emit("join-game", {
                        game_id: res["data"]["game"]["game_id"],
                    });
            });

            // Listen for join game response
            socket.on(`join-game`, (res) => {
                // Check if any error occurred
                if (!res["success"]) {
                    console.error(`Error ${res["error_code"]} while joining the game: ${res["error_message"]}`);
                    // #TODO - Handle error
                    return;
                }

                // Store response data (p.s. using snake case
                // to not interfere with globals)
                const game_id = res["data"]["game"]["game_id"]
                const game_room_id = res["data"]["game"]["game_room_id"];
                const player_number = res["data"]["player"]["player_number"];
                const player_marker = player_number === 1 ? "x" : "o"
                const is_player_turn = res["data"]["player"]["player_turn"]
                const opponent_id = res["data"]["opponent"]["opponent_id"];
                const opponent_username = res["data"]["opponent"]["opponent_username"];

                // Update necessary state variables
                setCurrentGameID(game_id);
                setCurrentGameRoomID(game_room_id);
                setCurrentGamePlayerNumber(player_number);
                setCurrentGamePlayerMarker(player_marker);
                setCurrentGamePlayerTurn(is_player_turn);
                setCurrentGameOpponentId(opponent_id);
                setCurrentGameOpponentUsername(opponent_username);
                setHasGameOngoing(true);

                console.log(`Started a game[#${game_id}] against ${opponent_username}[#${opponent_id}] ${is_player_turn ? 'with your turn first' : 'with opponent\'s turn first'}`);


            });
        }
    }, [socket]);

    // Initialize 3JS Scene
    useEffect(() => {
        // Initialize scene
        const scene = new SceneInit("3jsCanvas");
        scene.initScene();
        scene.animate();

        // Instances of mouse and raycaster
        const mouse = new Vector2();
        const raycaster = new Raycaster();

        // Set state variables
        setSceneState(scene);
        setMouseState(mouse);
        setRaycasterState(raycaster);
        setIsSceneDefined(true);
    }, [])

    // Update scene screen based on state change
    useEffect(() => {
        if (!isSceneDefined) {
            return;
        }

        switch (sceneScreenState) {
            case "main-menu":
                sceneState.scene.children.splice(0, sceneState.scene.children.length);
                sceneState.scene.add(screen_MainMenu());
                break;
            case "in-game":
                sceneState.scene.children.splice(0, sceneState.scene.children.length);
                sceneState.scene.add(screen_InGameScreen(0));
                console.log("added elements");
                break;
            default:
                // scene.scene.children.splice(0, scene.scene.children.length);
                break;
        }
    }, [sceneScreenState, sceneState]);

    // Animate scene elements
    useEffect(() => {
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

            if (!isSceneDefined) {
                return;
            }
            sceneState.scene.getObjectByName("titleGroup").children.forEach(scaleUp);
            sceneState.scene.getObjectByName("boardLinesGroup").children.forEach(scaleUp);
            sceneState.scene.getObjectByName("controlButtonsButtonsGroup").children.forEach(scaleUp);
            sceneState.scene.getObjectByName("controlButtonsTextGroup").children.forEach(scaleUp);
            sceneState.scene.getObjectByName("crossMarkerGroup").children.forEach(scaleUp);
            sceneState.scene.getObjectByName("circleMarkerGroup").children.forEach(scaleUp);

            requestAnimationFrame(animate);
        };

        animate();
    }, [sceneState]);

    // Event listeners for scene
    useEffect(() => {
        // Define function to handle player move
        const handlePlayerMove = (event, marker) => {
            // Obtain mouse's position
            mouseState.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseState.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Set up raycaster
            raycasterState.setFromCamera(mouseState, sceneState.camera);

            // Obtain list of objects raycaster intersects with
            const intersectsTiles = raycasterState.intersectObjects(
                sceneState.scene.getObjectByName("hiddenTilesGroup").children
            );

            // If raycaster intersects with any tile, identify it by UUID, and delete it
            if (intersectsTiles.length > 0) {
                const xOffset = intersectsTiles[0].object.position.x;
                const yOffset = intersectsTiles[0].object.position.y;

                // Draw marker depending on whose turn it is, update boardCopy, and mark
                if (marker === "x") {
                    sceneState.scene.getObjectByName("crossMarkerGroup").add(mesh_Cross(xOffset, yOffset));
                } else {
                    sceneState.scene.getObjectByName("circleMarkerGroup").add(mesh_Circle(xOffset, yOffset));
                }

                const index = sceneState.scene.getObjectByName("hiddenTilesGroup").children.findIndex(
                    (c) => c.uuid === intersectsTiles[0].object.uuid
                );
                sceneState.scene.getObjectByName("hiddenTilesGroup").children.splice(index, 1);
            }
        };

        // Check if the scene has been defined before adding event listeners
        if (!isSceneDefined) {
            return;
        }

        // Add event listener for player move
        window.addEventListener("mousedown", (event) => {
            if (!hasGameOngoing) {
                return;
            }
            if (!currentGamePlayerTurn) {
                return;
            }
            handlePlayerMove(event, currentGamePlayerMarker)

            // NEXT STEPS ::: only allow user to go 1 turn at a time, and once he does send that to server, so it will allow other player for turn
        }, false);
    }, [sceneState, currentGamePlayerMarker, currentGamePlayerTurn]);


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
