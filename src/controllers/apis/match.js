const express = require('express');
const auth = require('../../auth/auth')
const matchService = require('../../services/match');
let router = express.Router();

// Get list of possible user matchs, based on learn languages preferences
// check on req the user logged, and search for the informations
//http://localhost:3000/api/v1/usersMatch/possibleMatchs // GET REQUEST
router.get('/possibleMatchs', auth.isRequestUserAutheticatedAndValid, matchService.getPossibleMatchUsers);

// Get all matchs requests requested by the user
//http://localhost:3000/api/v1/usersMatch/requestedMatchsRequests // GET REQUEST
router.get('/requestedMatchsRequests', auth.isAuthenticated, matchService.getUserRequestedMatchsRequest);

// Get all matchs requests receipted by the user
//http://localhost:3000/api/v1/usersMatch/receiptMatchsRequests // GET REQUEST
router.get('/receiptMatchsRequests', auth.isAuthenticated, matchService.getUserReceiptMatchsRequests);

// Send a new match request
//http://localhost:3000/api/v1/usersMatch/sendRequest // POST REQUEST
router.post('/sendRequest', auth.isAuthenticated, matchService.sendNewMatchRequest);

// Accept a match request
//http://localhost:3000/api/v1/usersMatch/acceptMatchRequest/:matchId // POST REQUEST
router.post('/acceptMatchRequest/:matchId', auth.isAuthenticated, matchService.acceptNewMatchRequest);

// Deny a match request
//http://localhost:3000/api/v1/usersMatch/denyMatchRequest/:matchId // POST REQUEST
router.post('/denyMatchRequest/:matchId', auth.isAuthenticated, matchService.denyMatchRequest);

// Get user active matches
//http://localhost:3000/api/v1/usersMatch/getUserActiveMatches // GET REQUEST
router.get('/getUserActiveMatches', auth.isAuthenticated, matchService.getUserCurrentActiveMatches);

//Remove existing match
//http://localhost:3000/api/v1/usersMatch/removeExistingMatch/ // POST REQUEST
router.post('/removeExistingMatch', auth.isAuthenticated, matchService.removeExistingMatch);

// Cancel send requests
//http://localhost:3000/api/v1/usersMatch/cancelSendRequest/:matchId // POST REQUEST
router.post('/cancelSendRequest/:matchId', auth.isAuthenticated, matchService.cancelSendRequest);

module.exports = router;