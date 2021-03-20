const server = require('./configs/app')();
const config = require('./configs/config/config');
const db = require('./configs/db');
const auth = require('./configs/auth/auth')

//create the basic server setup 
server.create(config, db);

//start the server
server.start();