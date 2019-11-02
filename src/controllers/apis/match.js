const express = require('express');
const auth = require('../../auth/auth')
const matchService = require('../../services/match');
let router = express.Router();

// Get list of possible user matchs, based on learn languages preferences
router.get('/possibleMatchs/:email', auth.isAuthenticated, matchService.getPossibleMatchUsers);

// Get all matchs requested by the user
router.get('/requestedMatchs/:id', auth.isAuthenticated, matchService.getUserMatchsRequested);

// Send a new match request
router.post('/sendRequest', auth.isAuthenticated, matchService.sendNewMatchRequest );

// Accept a match request

// Deny a match request

module.exports = router;