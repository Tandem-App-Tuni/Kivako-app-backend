const userController = require('../../controllers/apis/user');
const matchController = require('../../controllers/apis/match');
const chatController = require('../../controllers/apis/chat');

const express = require('express');
let router = express.Router();

router.use('/users', userController);
router.use('/usersMatch', matchController);
router.use('/chat', chatController); // Router handeling chat requests

module.exports = router;
