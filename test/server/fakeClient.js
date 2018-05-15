import SocketIOClient from 'socket.io-client';

export const port = 33457;

export default () => {
  const socket = new SocketIOClient(`http://localhost:${port}`, {
    transport: ['websockets'],
  });

  return socket;
};
