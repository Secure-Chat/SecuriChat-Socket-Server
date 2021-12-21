'use strict';

const socketio = require('socket.io');
const PORT = process.env.PORT || 3030;
const server = socketio(PORT);
const ezchat = server.of('/ezchat');

ezchat.on('connection', (socket) => {
  console.log(`${socket.id} connected to ezchat server`);

  socket.on('join', (payload) => {
    for (const room of payload.rooms) {
      socket.join(room);
      console.log(`${socket.id} joined room: ${room}`);
      ezchat.to(room).emit('roomSyncRequest',{room});
    }
  });

  socket.on('send', (payload) => {
    const messageTime = Date.now();
    ezchat.to(payload.room).emit('message', {...payload, messageTime});
  });

  socket.on('received', (payload) => {
    ezchat.to(payload.room).emit('received', payload);
  })
});
