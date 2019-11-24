const express = require('express');
const auth = require('../../auth/auth')
const chatService = require('../../services/chat');
let router = express.Router();

//router.get('/alive', auth.isAuthenticated, chatService.alive);
router.get('/partners&requests', auth.isAuthenticated, chatService.partnersrequests);

module.exports = router;