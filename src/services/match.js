/********
 * match.js file (services/matchs)
 ********/
const express = require('express');
const User = require('../models/user');
const Helper = require('./helper');
const Match = require('../models/match');
var mongoose = require('mongoose');

// Chat database structures
const Room = require('../models/room.js');


const getPossibleMatchUsers = async (req, res, next) => {
    try {

        //Get user request informations
        const userInfo = await Helper.getUserLoggedInfoWithEmail(req);
        //console.log(userInfo.email)

        // Get user informations to be used in search match database query
        const userLearnLanguages = userInfo.languagesToLearn;
        const userID = userInfo._id;

        let usersList = [];
        let languagesList = [];

        // Check in each learn language the possible matchs, and save this users in a list
        for (i = 0; i < userLearnLanguages.length; i++) {

            languagesList.push(userLearnLanguages[i].language);
            // Get all users that match, but not the user that made the request and users that user have a match already
            // $ne -> mongodb query that mean Not Equals.
            let users = await User.find({
                "languagesToTeach.language": userLearnLanguages[i].language,
                "_id": {
                    $ne: userID
                }
            }, {
                userIsActivie: 0,
                lastUserAccess: 0,
                __v: 0,
                matches: 0
            }); //Fields that will not be returned in result

            if (users == []) {
                // Nothing to do
                usersList.push([]);
                //console.log("No potential match users in this language");
            } else {
                // Add possible match users to list
                usersList.push(users);
            }
            users = null;
        }

        let sendArrayFormated = [];
        for (i = 0; i < languagesList.length; i++) {
            sendArrayFormated.push({
                'languageName': languagesList[i],
                'matches': usersList[i]
            })
        }

        // Send result
        if (usersList.length > 0) {
            return res.status(200).json({
                // Create data section with language as key value of the users
                'userPossibleMatches': sendArrayFormated
            });
        }

        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found in match :(. Update your settings to have more chances :)!'
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

// REQUESTS
const getUserRequestedMatchsRequest = async (req, res, next) => {
    try {
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);
        const userID = user._id;

        // Check if data is valid
        if (userID === undefined || userID === null) {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'Request User ID is required!'
            });
        }

        let usersMatchRequestList = await Match.find({
                "requesterUser": {
                    $eq: userID
                }
            })
            .populate('recipientUser', '-userIsActivie -lastUserAccess -matches -__v');

        // Send result
        return res.status(200).json({
            'message': 'matchs fetched successfully',
            // Create data section with language as key value of the users
            'matchs': usersMatchRequestList
        });


    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getUserReceiptMatchsRequests = async (req, res, next) => {
    try {
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);
        const userID = user._id;

        // Check if data is valid
        if (userID === undefined || userID === null) {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'Request User ID is required!'
            });
        }

        let usersMatchRequestList = await Match.find({
                "recipientUser": {
                    $eq: userID
                },
                "status": {
                    $eq: 1
                }
            })
            .populate('requesterUser', '-userIsActivie -lastUserAccess -__v')

        // Send result
        return res.status(200).json({
            'userReceiptMatches': usersMatchRequestList
        });

    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const sendNewMatchRequest = async (req, res, next) => {

    try {
        const requesterUser = await Helper.getUserIdFromAuthenticatedRequest(req);
        const requesterUserID = requesterUser._id;

        const recipientUserID = mongoose.Types.ObjectId(req.body.recipientID);

        // Check if a request for this user already exists
        let matchUserAsRequester = await Match.findOne({
            "requesterUser": requesterUserID,
            "recipientUser": recipientUserID
        });
        let matchUserAsRecipient = await Match.findOne({
            "requesterUser": recipientUserID,
            "recipientUser": requesterUserID
        });

        if ((matchUserAsRecipient === null) && (matchUserAsRequester === null)) {
            //Match request doesn't exist, create one
            const temp = {
                requesterUser: requesterUserID,
                recipientUser: recipientUserID,
                matchLanguage: req.body.matchLanguage
            };

            let newMatch = await Match.create(temp);
            //let newMatch = true

            if (newMatch) {
                return res.status(201).json({
                    'requested': true,
                    'status': "new"
                });
            } else {
                return res.status(201).json({
                    'requested': false,
                    'status': "fail"
                });
            }
        } else if ((matchUserAsRecipient === null) || (matchUserAsRequester === null)) {
            return res.status(201).json({
                'requested': true,
                'status': "exist"
            });
        } else {
            return res.status(201).json({
                'requested': false,
                'status': "fail"
            });
        }

    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const acceptNewMatchRequest = async (req, res, next) => {
    try {
        // Receipt user accept the match
        const matchId = req.params.matchId;
        const matchExists = await Match.findById(matchId);

        if (!matchExists) {
            return res.status(404).json({
                'code': 'BAD_REQUEST_ERROR',
                'description': 'No match found with this ID found in the system'
            });
        }

        let temp = {
            status: 2, // Status 2 -> Accepted 
            matchChatChanell: toString(matchExists.recipientUser + matchExists.requesterUser + Date.now()), // TODO implement chat function to generate a new channel, next sprint
            matchStartDate: Date.now()
        }

        let updateMatch = await Match.findByIdAndUpdate(matchId, {
            $set: temp
        });

        console.log('Matching user...');

        if (updateMatch) {

            // Get new informations from database after update
            let updatedMatchInformations = await Match.findById(matchId);

            // Add the new match to users match list
            let updateRequestUser = await User.findByIdAndUpdate(matchExists.requesterUser, {
                $push: {
                    matches: matchId
                }
            });
            let updateReceipUser = await User.findByIdAndUpdate(matchExists.recipientUser, {
                $push: {
                    matches: matchId
                }
            });

            // CREATE NEW CHAT ROOM
            let roomId = updateRequestUser.email + '|' + updateReceipUser.email;
            let roomVr = await Room.findOne({
                roomId: roomId
            });

            if (roomVr) throw new Error('Room already exists! Duplicated match request!', roomId);

            await User.findByIdAndUpdate(matchExists.requesterUser, {
                $push: {
                    rooms: roomId
                }
            });
            await User.findByIdAndUpdate(matchExists.recipientUser, {
                $push: {
                    rooms: roomId
                }
            });

            roomVr = await Room.create({
                roomId: roomId
            });


            if (updateRequestUser && updateReceipUser) {
                return res.status(200).json({
                    'requested': true,
                    'data': updatedMatchInformations
                });
            } else {
                throw new Error('something went wrong');
            }

        } else {
            throw new Error('something went wrong');
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const denyMatchRequest = async (req, res, next) => {
    try {
        // Receipt user accept the match
        const matchId = req.params.matchId;
        const matchExists = await Match.findById(matchId);

        if (!matchExists) {
            return res.status(404).json({
                'code': 'BAD_REQUEST_ERROR',
                'description': 'No match found with this ID in the database'
            });
        }

        const temp = {
            status: 3, // 3 -> Match Not accepted
            matchEndDate: Date.now()
        }

        let updateMatch = await Match.findByIdAndUpdate(matchId, {
            $set: temp
        });


        if (updateMatch) {
            // Get new informations from database after update
            let updatedMatchInformations = await Match.findById(matchId);

            return res.status(200).json({
                'message': 'Match updated successfully',
                'data': updatedMatchInformations
            });
        } else {
            throw new Error('something went wrong');
        }

    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

// VALID MATCHES
const getUserCurrentActiveMatches = async (req, res, next) => {
    try {
        //Get user request informations
        const userInfo = await Helper.getUserLoggedInfoWithEmail(req);


        //TODO CONSIDER POSSIBILITY OF THIS BECOME A FUNCTION THAT RETURNS A LIST OF THE MATCHES AND INFORMATIONS
        // since maybe will be used in chat too
        let userMatchList = await User.findById(userInfo._id, 'matches').populate({
            path: 'matches',
            populate: 'requesterUser recipientUser'
        })


        let userActiveMatchesList = [];

        for (i = 0; i < userMatchList.matches.length; i++) {

            if (userMatchList.matches[i].status == 2) {
                // Nothing to do
                userActiveMatchesList.push(userMatchList.matches[i]);
            }
        }

        //console.log(userActiveMatchesList);

        if (userMatchList) {
            return res.status(200).json({
                'message': 'Matches get successfully',
                'data': userActiveMatchesList
            });
        } else {
            throw new Error('something went wrong');
        }

    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getUserOldMatches = async (req, res, next) => {
    try {
        //Get user request informations
        const userInfo = await Helper.getUserLoggedInfoWithEmail(req);

        let userMatchList = await User.findById(userInfo._id, 'matches').populate({
            path: 'matches',
            populate: 'requesterUser recipientUser'
        })


        let userOldMatchesList = [];

        for (i = 0; i < userMatchList.matches.length; i++) {

            if (userMatchList.matches[i].status > 2) {
                // Nothing to do
                userOldMatchesList.push(userMatchList.matches[i]);
            }
        }

        if (userMatchList) {
            return res.status(200).json({
                'message': 'Matches get successfully',
                'data': userOldMatchesList
            });
        } else {
            throw new Error('something went wrong');
        }

    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}


// TODO -> Maybe create a folder for match -> request, valid match, list of matchs

module.exports = {
    getPossibleMatchUsers: getPossibleMatchUsers,
    sendNewMatchRequest: sendNewMatchRequest,
    getUserRequestedMatchsRequest: getUserRequestedMatchsRequest,
    getUserReceiptMatchsRequests: getUserReceiptMatchsRequests,
    acceptNewMatchRequest: acceptNewMatchRequest,
    denyMatchRequest: denyMatchRequest,
    getUserCurrentActiveMatches: getUserCurrentActiveMatches,
    getUserOldMatches: getUserOldMatches
}