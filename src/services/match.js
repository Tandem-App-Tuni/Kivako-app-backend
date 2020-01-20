/********
 * match.js file (services/matchs)
 ********/
const User = require('../models/user');
const Helper = require('./helper');
const Match = require('../models/match');
var mongoose = require('mongoose');

// Chat database structures
const Room = require('../models/room.js');
const Constants = require('../configs/constants.js');

const getPossibleMatchUsers = async (req, res, next) => {
    try 
    {
        console.log('Retrieving possible matches...');

        //Get user request informations
        const userInfo = await Helper.getUserLoggedInfoWithEmail(req);

        // Get user informations to be used in search match database query
        const userLearnLanguages = userInfo.languagesToLearn;
        const userID = userInfo._id;

        let filterIds = [userID];
        let languagesList = [];

        console.log('User ID:', userID);

        if (userInfo.matches.length > Constants.maxMatchCount)
        {
            return res.status(404).json({
                'code': 'BAD_REQUEST_ERROR',
                'description': 'You have exceeded the maximal match count limit.'
            });
        }

        for (i = 0; i < userInfo.matches.length; i++)
        {
            const match = await Match.findById(userInfo.matches[i]);

            if (match)
            {
                if (userID.equals(match.requesterUser)) filterIds.push(match.recipientUser);
                else if (userID.equals(match.recipientUser)) filterIds.push(match.requesterUser);
                else console.log('Impossible match!');
            }
        }

        console.log('User matches number:', userInfo.matches.length, Constants.maxMatchCount);
        console.log('Unwanted ids:', filterIds);

        /**
         * Check in each learn language the possible matchs, and save this users in a list.
         * Sort the matched users by the amount of correspondence 
         * between the teach and want to learn languages.
         * Get all users that match, but not the user that made the request and users that user have a match already
         * $ne -> mongodb query that mean Not Equals.
         */
        let languagesToTeach = userInfo.languagesToTeach;
        let nLanguages = languagesToTeach.length;
        let sendArrayFormated = [];
        let nUsers = 0;
        for (i = 0; i < userLearnLanguages.length; i++) 
        {
            languagesList.push(userLearnLanguages[i].language);

            let users = await User.find({
                "languagesToTeach.language": userLearnLanguages[i].language,
                "_id": {
                    $nin: filterIds
                }
            }, {
                userIsActivie: 0,
                lastUserAccess: 0,
                __v: 0,
                matches: 0,
                password: 0,
                isAdmin: 0
            }).lean();

            users.forEach(e => 
            {
                let n = 0;
                for (j = 0; j < nLanguages; j++)
                    for (g = 0; g < e.languagesToLearn.length; g++)
                        if (e.languagesToLearn[g].language === languagesToTeach[j].language) n++;
                    
                e.fitQuality = n/nLanguages;
            });

            nUsers += users.length;

            sendArrayFormated.push({
                'languageName': languagesList[i],
                'matches': users.length === 0 ? [] : users
            })
        }

        for (j = 0; j < sendArrayFormated.length; j++)
            sendArrayFormated[j].matches.sort((e0, e1) => e0.fitQuality < e1.fitQuality);

        return res.status(200).json({
            // Create data section with language as key value of the users
            'userPossibleMatches': sendArrayFormated
        });
    } catch (error) 
    {
        console.log('Error:', error);

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

        if (requesterUser.matches.length >= Constants.maxMatchCount)
        {
            return res.status(201).json(
            {
                'requested': false,
                'status': 'fail'
            });
        }

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
    try 
    {
        // Receipt user accept the match
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);

        if (user.matches.length >= Constants.maxMatchCount)
        {
            return res.status(201).json(
                {
                    'requested': false,
                    'status': 'fail'
                }); 
        }

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
            matchChatChanell: toString(matchExists.recipientUser + matchExists.requesterUser + Date.now()),
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
                'data': userActiveMatchesList,
                'userId': userInfo._id
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

//REMOVING EXISTING MATCHES
const removeExistingMatch = async(req, res, next) =>
{
    try
    {
        const matchData = req.body;
        const match = await Match.findById(matchData.matchId);

        if (match != null)
        {
            console.log('Removing match:', match._id);

            const user0 = await User.findById(match.requesterUser);
            const user1 = await User.findById(match.recipientUser);

            const roomId = user0.email + '|' + user1.email;

            console.log('Removing room:',roomId);

            const roomRemoved = await Room.findOne({roomId:roomId}); //Change to remove
            if (roomRemoved != null) console.log('Room found!', roomRemoved);

            const user0UpdatedRooms = user0.rooms.filter(element => element.localeCompare(roomId));
            const user1UpdatedRooms = user1.rooms.filter(element => element.localeCompare(roomId));

            const user0UpdatedMatches = user0.matches.filter(element => element.toString().localeCompare(matchData.matchId));
            const user1UpdatedMatches = user1.matches.filter(element => element.toString().localeCompare(matchData.matchId));

            User.findByIdAndUpdate(
                {_id:user0._id},
                {rooms: user0UpdatedRooms,
                matches: user0UpdatedMatches},
                function(err, result) 
                {
                    if (err) console.log('Error updating user0:',err);
                }
            );

            User.findByIdAndUpdate(
                user1._id,
                {rooms: user1UpdatedRooms,
                matches: user1UpdatedMatches},
                function(err, result) 
                {
                    if (err) console.log('Error updating user1:',err);
                }
            );

            Match.findByIdAndRemove(
                match._id,
                function(err, result)
                {
                    if (err) console.log('Error removing match:',err);
                }
            );

            Room.findOneAndRemove(
                {roomId:roomId},
                function(err, result)
                {
                    if (err) console.log('Error removing room:',err);
                }
            );

            res.status(200).json(
            {
                'message': 'Match removed!'
            });
        }
        else 
        {
            console.log('Match does not exist!');
            res.status(500).json(
            {
                'message': 'Server error while removing match -> match does not exist'
            });
        }
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json(
        {
            'message': 'Server error while removing match!'
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
    getUserOldMatches: getUserOldMatches,
    removeExistingMatch:removeExistingMatch
}