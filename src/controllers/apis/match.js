const express = require('express');
const auth = require('../../auth/auth')
const matchService = require('../../services/match');
let router = express.Router();

// Get list of possible user matchs, based on learn languages preferences
router.get('/possibleMatchs/:email', auth.isAuthenticated, matchService.getPossibleMatchUsers);

// Get all user matchs

// Send a new match request
router.post('/sendRequest', auth.isAuthenticated, )

// Accept a match request

// Deny a match request

module.exports = router;