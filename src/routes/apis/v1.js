const userController = require('../../controllers/apis/user');
const matchController = require('../../controllers/apis/match');


const express = require('express');
let router = express.Router();

router.use('/users', userController);
router.use('/usersMatch', matchController);

module.exports = router;
