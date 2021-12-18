'use strict';

require('dotenv').config();
const client = require('socket.io-client');
const { getUserData, saveUserData } = require('./components/dataStore');
const axios = require('axios');
const PORT = process.env.PORT || 3030;
const base64 = require('base-64');

//authentication stuff
const username = "testUser01";
const password = "testPassword01";
// const DB_SERVER_URL = process.env.DB_SERVER_URL_DEV;
const DB_SERVER_URL = process.env.DB_SERVER_URL;
const loginData = {
  username,
  password
}

const loginString = `${username}:${password}`;
axios.post(`${DB_SERVER_URL}/signin`, {}, {
  headers: {
    'Authorization': `Basic ${base64.encode(loginString)}`
  }
})
.then( response => {
  const { token, rooms } = response.data.userInfo;
  const user = client(`https://ez-chat-server.herokuapp.com/ezchat`);
  // const user = client(`http://localhost:${PORT}/ezchat`);

  let userData = getUserData(loginData);
  let { messageQueue, messageHistory } = userData;

  for (const room of rooms) {
    if (!(room in messageQueue)) messageQueue[room] = [];
  }

  const payload = {
    rooms,
  };
  console.log(rooms)
  
  user.emit('join', payload);
  
  user.on('roomSyncRequest', (payload) => {
    const { room } = payload;
  
    for (const message of messageQueue[room]) {
      user.emit('send', {
        username,
        message,
        room
      })
    }
  })
  
  user.on('message', (payload) => {
    console.log("Payload: ",payload, "<-----------------------")
    if (!(payload.username === username)) {
      const { message, messageTime } = payload;
      messageHistory.push({
        message,
        username: payload.username,
        dateTime: messageTime
      });
      console.log("Payload: ",payload, "<-----------------------")
      console.log("Received: ", message);
      user.emit('received', payload);
      let userDataToSave = {
        username,
        password,
        parsedUserData: {
          messageQueue,
          messageHistory
        }
      }
      saveUserData(userDataToSave);
    }
  });
  
  user.on('received', (payload) => {
    const { message, username, room } = payload;
    if (username === loginData.username) {
      const messagePosition = messageQueue[room].indexOf(message);
      if (messagePosition > -1) messageQueue[room].slice(messagePosition, 1);
    }
  })
  
  const send = (messageData) => {
    const { message, room } = messageData;
  
    messageQueue[room].push(message)
    const payload = {
      username,
      message,
      room,
    };
    user.emit('send', payload);
    let userDataToSave = {
      username,
      password,
      parsedUserData: {
        messageQueue,
        messageHistory
      }
    }
    saveUserData(userDataToSave);
  };

  //testing messaging capabilities
  setInterval(function(){send({message:"A message from 1 to 2.", room:rooms[0]})},1000)

  user.on('disconnect', () => {
    let userDataToSave = {
      username,
      password,
      parsedUserData: {
        messageQueue,
        messageHistory
      }
    }
    saveUserData(userDataToSave);
  })
})
.catch(error => console.log);


