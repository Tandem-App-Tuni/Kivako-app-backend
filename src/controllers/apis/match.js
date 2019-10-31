const express = require('express');
const auth = require('../../auth/auth')
const matchService = require('../../services/match');
let router = express.Router();

router.get('/:id', auth.isAuthenticated, matchService.getPossibleMatchUsers);

module.exports = router;