import {io} from "socket.io-client";
import {useEffect, useState} from "react";

function App() {
    const [socketInstance, setSocketInstance] = useState("");
    const [loading, setLoading] = useState(true);
    const [buttonStatus, setButtonStatus] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    let socket;

    useEffect(() => {

        // create websocket/connect
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

        return () => {
            // disconnect socket when component unmounts
            socket.disconnect();
        };
    }, [username, password, email]);

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
            <h2>Login</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>

            <h2>Registration</h2>
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegistration}>Register</button>

            <button onClick={() => socket.emit("session")}>Test</button>
        </div>
    );
}

export default App;
