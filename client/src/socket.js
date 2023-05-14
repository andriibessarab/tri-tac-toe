import {io} from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = undefined;

const socket = io(URL, {
    autoConnect: true,
    cors: {
        origin: '*'
    }});

export default socket;
