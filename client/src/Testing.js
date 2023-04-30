import React, {useEffect, useState} from "react";
import socket from "./socket";

export default function App() {
    // Socket state
    const [isConnected, setIsConnected] = useState(socket.connected);

    // User auth states
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userEmail, setUserEmail] = useState(null);

    // Auth forms states
    const [formUserName, setFormUserName] = useState("");
    const [formUserEmail, setFormUserEmail] = useState("");
    const [formUserPassword, setFormUserPassword] = useState("")


    useEffect(() => {
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("register-success", onRegisterSuccess);
        socket.on("register-fail", onRegisterFailed);
        socket.on("login-success", onLogInSuccess);
        socket.on("login-fail", onLogInFailed);
        socket.on("logout", onLogOut);

        return () => {
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
            <canvas id="3jsCanvas"/>
            <div id={"debug"}>
                <h2>Login</h2>
                <input type="text" placeholder="Username" value={formUserName}
                       onChange={(e) => setFormUserName(e.target.value)}/>
                <input type="password" placeholder="Password" value={formUserPassword}
                       onChange={(e) => setFormUserPassword(e.target.value)}/>
                <button onClick={handleLogIn}>Login</button>

                <h2>Registration</h2>
                <input type="text" placeholder="Email" value={formUserEmail} onChange={(e) => setFormUserEmail(e.target.value)}/>
                <input type="text" placeholder="Username" value={formUserName}
                       onChange={(e) => setFormUserName(e.target.value)}/>
                <input type="password" placeholder="Password" value={formUserPassword}
                       onChange={(e) => setFormUserPassword(e.target.value)}/>
                <button onClick={handleRegister}>Register</button>

                <h2>Other Actions</h2>
                <button onClick={() => socket.emit("logout")}>Log Out</button>
                {/*<button onClick={() => socket.emit("session")}>Session Info</button>*/}
                {/*<button onClick={handleJoinGame} disabled={isWaitingToJoinGame}>*/}
                {/*    {isWaitingToJoinGame ? "Waiting for opponent..." : "Play Online"}*/}
                {/*</button>*/}
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
};


