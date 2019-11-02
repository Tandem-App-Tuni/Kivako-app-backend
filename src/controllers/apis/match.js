const express = require('express');
const auth = require('../../auth/auth')
const matchService = require('../../services/match');
let router = express.Router();

// Get list of possible user matchs, based on learn languages preferences
router.get('/possibleMatchs/:email', auth.isRequestUserAutheticatedAndValid, matchService.getPossibleMatchUsers);

// Get all matchs requests requested by the user
router.get('/requestedMatchsRequests/:userId', auth.isAuthenticated, matchService.getUserRequestedMatchsRequest);

// Get all matchs requests receipted by the user
router.get('/receiptMatchsRequests/:userId', auth.isAuthenticated, matchService.getUserReceiptMatchsRequests);

// Send a new match request
router.post('/sendRequest', auth.isAuthenticated, matchService.sendNewMatchRequest);

// Accept a match request
router.post('/acceptMatchRequest/:matchId', auth.isAuthenticated, matchService.acceptNewMatchRequest);

// Deny a match request
router.post('/denyMatchRequest/:matchId', auth.isAuthenticated, matchService.denyMatchRequest);


// Get user active matches
router.get('/getUserActiveMatches/:email', auth.isAuthenticated, matchService.getUserCurrentActiveMatches);

// Get user old matches
router.get('/getUserOldMatches/:email', auth.isAuthenticated, matchService.getUserOldMatches);

module.exports = router;