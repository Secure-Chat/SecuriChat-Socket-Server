'use strict';

// const PLATFORM = process.platform;
// console.log("Platform: ", PLATFORM);

const fs = require('fs');
const client = require('socket.io-client');

// on authentication
const getUserData = (user) => {
  const { username, password } = user;
  let userData = {
    username,
    messageQueue: {},
    messageHistory: [],
  };


  try {
    fs.readFile(`userData-${username}.json`, (err, data) => {
      if(err) {
        if (err.code === 'ENOENT') {
          return userData;
        }
      }
      let parsedUserData = JSON.parse(data);
      for (const key in userData) {
        if (key in parsedUserData) {
          userData[key] = parsedUserData[key];
        }
      }
    });

    return userData;
  } catch (err) {
    console.error(err);
  }
}

const saveUserData = ( payload ) => {
  const { username, password, parsedUserData } = payload;
  try {
    fs.writeFile(`userData-${username}.json`, JSON.stringify(parsedUserData), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  getUserData,
  saveUserData
}
