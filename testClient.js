'use strict';

const client = require('socket.io-client');
const PORT = process.env.PORT || 3030;

const user = client(`http://localhost:3030/securechat`);


