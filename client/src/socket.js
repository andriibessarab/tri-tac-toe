import {io} from 'socket.io-client';

const socket = io("http://multi-tac.herokuapp.com:" + location.port, {autoConnect: true,});

export default socket;
