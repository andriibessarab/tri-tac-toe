import {io} from "socket.io-client";
import {useEffect, useState} from "react";

function App() {
    const [socketInstance, setSocketInstance] = useState("");
    const [loading, setLoading] = useState(true);
    const [buttonStatus, setButtonStatus] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    let socket;

    useEffect(() => {

        // create websocket/connect
        socket = io();

        // listen for login response
        socket.on("login", (data) => {
            // parse data received from server
            console.log("Login response:", data);
        });

        return () => {
            // disconnect socket when component unmounts
            socket.disconnect();
        };
    }, [username, password]);

    const handleLogin = () => {
        // send login event to server with username and password
        socket.emit("login", {username, password});
    };

    return (
        <div className="App">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default App;
