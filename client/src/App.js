import React, { useState, useEffect } from 'react';

import GameScreen from "./pages/GameScreen";

const App = () => {

    // const [data, setData] = useState([{}])
    //
    // // Fetch members route
    // useEffect(()=> {
    //     fetch("/members")
    //         .then(
    //             res => res.json()
    //         )
    //         .then(
    //             data => {
    //                 setData(data)
    //                 console.log(data)
    //             }
    //         )
    // }, [])

    return (
        <div className="App">
            <GameScreen/>
        </div>
    );
};

export default App;