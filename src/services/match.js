/********
* match.js file (services/matchs)
********/
const express = require('express');
const User = require('../models/user');
const Helper = require('./helper');
const Match = require('../models/match');
var mongoose = require('mongoose');


const getPossibleMatchUsers = async (req, res, next) => {
    try {

        //Get user request informations
        const userInfo = await Helper.getUserInfoWithEmail(req);
        
        // Get user informations to be used in search match database query
        const userLearnLanguages = userInfo.languagesToLearn;
        const userID = userInfo._id;
        
        let usersList = [];
        let languagesList = [];

        // Check in each learn language the possible matchs, and save this users in a list
        for (i = 0; i < userLearnLanguages.length; i++) {
            
            languagesList.push(userLearnLanguages[i].language);
            // Get all users that match, but not the user that made the request
            // $ne -> mongodb query that mean Not Equals.
            let users = await User.find({"languagesToTeach.language":userLearnLanguages[i].language, "_id":{$ne:userID}},
                                        {userIsActivie:0, lastUserAccess: 0,__v: 0,matches: 0}); //Fields that will not be returned in result
        
            if(users == []){
                // Nothing to do
                //console.log("No potential match users in this language");
            }else{
                // Add possible match users to list
                usersList.push(users);
            }
            users = null;
        }

        // Send result
        if (usersList.length > 0) {
            return res.status(200).json({
                'message': 'users fetched successfully',
                'languages': languagesList ,
                // Create data section with language as key value of the users
                'data': {[languagesList[0]]:usersList[0],[languagesList[1]]:usersList[1],[languagesList[2]]:usersList[2]}
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
        const userID = req.params.userId;

        // Check if data is valid
        if (userID === undefined || userID === null) {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'Request User ID is required!'
            });
        }

        let usersMatchRequestList = await Match.find({"requesterUser":{$eq:userID}})
                                               //.populate('requesterUser','-userIsActivie -lastUserAccess -__v')
                                               //.populate('recipientUser','-userIsActivie -lastUserAccess -__v');

        // Send result
        if (usersMatchRequestList.length > 0) {
            return res.status(200).json({
                'message': 'matchs fetched successfully',
                // Create data section with language as key value of the users
                'matchs':usersMatchRequestList
            });
        }

        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found'
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
        const userID = req.params.userId;

        // Check if data is valid
        if (userID === undefined || userID === null) {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'Request User ID is required!'
            });
        }

        let usersMatchRequestList = await Match.find({"recipientUser":{$eq:userID}})
                                               //.populate('requesterUser','-userIsActivie -lastUserAccess -__v')
                                               //.populate('recipientUser','-userIsActivie -lastUserAccess -__v');

        // Send result
        if (usersMatchRequestList.length > 0) {
            return res.status(200).json({
                'message': 'matchs fetched successfully',
                // Create data section with language as key value of the users
                'matchs':usersMatchRequestList
            });
        }

        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found'
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
        const requesterUser = mongoose.Types.ObjectId(req.body.requesterID);
        const recipientUser = mongoose.Types.ObjectId(req.body.recipientID);

        
        // Check if users exist in database
        let userRequesterExists = await User.findById(requesterUser);

        if (!userRequesterExists) {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'Requester User ID is not valid!'
            });
        }
        let userRecipientExists = await User.findById(requesterUser);

        if (!userRecipientExists) {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'Recipient User ID is not valid!'
            });
        }
        
        const temp = {
            requesterUser:requesterUser,
            recipientUser:recipientUser
        };

        let newMatch = await Match.create(temp);

        if (newMatch) {
            return res.status(201).json({
                'message': 'match request created successfully',
                'data': newMatch
            });
        } else {
            throw new Error('something went worng');
        }

        /*
        const newMatchRequest = new Match(temp);

        newMatchRequest.save().then(result => {
            res.status(201).json({
                message: "Match registered successfully!",
                match: {
                    _id: result._id,
                }
            })
        }).catch(err => {
            console.log(err),
                res.status(500).json({
                    error: err
                });
        })
        */


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
            status: 2, // 2 -> Accepted
            matchChatChanell:"teste", // TODO implement chat function to generate a new channel, next sprint
            matchStartDate:Date.now()
        }

        let updateMatch = await Match.findByIdAndUpdate(matchId, {$set: temp});

        if (updateMatch) {
            // Get new informations from database after update
            let updatedMatchInformations = await Match.findById(matchId);
            
            // Add the new match to users match list
            let updateRequestUser = await User.findByIdAndUpdate(matchExists.requesterUser, { $push: { matches: matchId } });
            let updateReceipUser = await User.findByIdAndUpdate(matchExists.requesterUser, { $push: { matches: matchId } });
            if(updateRequestUser && updateReceipUser){
                return res.status(200).json({
                    'message': 'Match updated successfully',
                    'data': updatedMatchInformations
                });
            }else{
                throw new Error('something went wrong');
            }

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
            matchEndDate:Date.now()
        }

        let updateMatch = await Match.findByIdAndUpdate(matchId, {$set: temp});


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
        const userInfo = await Helper.getUserInfoWithEmail(req);

        //TODO CONSIDER POSSIBILITY OF THIS BECOME A FUNCTION THAT RETURNS A LIST OF THE MATCHES AND INFORMATIONS
        // since maybe will be used in chat too
        let userMatchList = await User.findById(userInfo._id,'matches').populate({
                                                                            path:'matches',
                                                                            populate: 'requesterUser recipientUser'
                                                                        })
        

        let userActiveMatchesList = [];
        
        for (i = 0; i < userMatchList.matches.length; i++) {
        
            if(userMatchList.matches[i].status == 2){
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
        const userInfo = await Helper.getUserInfoWithEmail(req);

        let userMatchList = await User.findById(userInfo._id,'matches').populate({
                                                                            path:'matches',
                                                                            populate: 'requesterUser recipientUser'
                                                                        })
        

        let userOldMatchesList = [];
        
        for (i = 0; i < userMatchList.matches.length; i++) {
        
            if(userMatchList.matches[i].status > 2 ){
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
    getUserRequestedMatchsRequest:getUserRequestedMatchsRequest,
    getUserReceiptMatchsRequests:getUserReceiptMatchsRequests,
    acceptNewMatchRequest:acceptNewMatchRequest,
    denyMatchRequest:denyMatchRequest,
    getUserCurrentActiveMatches:getUserCurrentActiveMatches,
    getUserOldMatches:getUserOldMatches
}