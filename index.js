'use strict';

const socketio = require('socket.io');
const PORT = process.env.PORT || 3030;
const server = socketio(PORT);
const ezchat = server.of('/securechat');

ezchat.on('connection', (socket) => {
  console.log(`${socket.id} connected to secure chat server`);

  socket.on('join', (payload) => {
    for (const room of payload.rooms) {
      socket.join(room);
      console.log(`${socket.id} joined room: ${room}`);
      ezchat.to(room).emit('roomSyncRequest',{room});
    }
  });

  socket.on('send', (payload) => {
    console.log('Event: send, payload: ', payload);
    if (!('messageTime' in payload)) payload['messageTime'] = Date.now();
    ezchat.to(payload.room).emit('message', payload);
  });

  socket.on('received', (payload) => {
    console.log('Event: received, payload: ', payload);
    ezchat.to(payload.room).emit('received', payload);
  })
});
