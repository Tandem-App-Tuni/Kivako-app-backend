/********
 * match.js file (services/matchs)
 ********/
const User = require('../models/user');
const Helper = require('./helper');
const Match = require('../models/match');
var mongoose = require('mongoose');
const emailServer = require('../emailServer');

// Chat database structures
const Room = require('../models/room.js');
const Constants = require('../configs/constants.js');

const getPossibleMatchUsers = async (req, res, next) => 
{
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

            if (match) filterIds.push(userID.equals(match.requesterUser) ? match.recipientUser : match.requesterUser);
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

        return res.status(200).json({'userPossibleMatches': sendArrayFormated});
    } 
    catch (error) 
    {
        console.log('Error:', error);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getUserRequestedMatchsRequest = async (req, res, next) => 
{
    try 
    {
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);
        const userID = user._id;

        if (!user) return res.status(422).json({'code': 'REQUIRED_FIELD_MISSING','description': 'Request User ID is required!'});

        let usersMatchRequestList = await Match.find({$and: [{_id: {$in: user.matches}}, {requesterUser: {$eq: userID}}]})
                                          .populate('recipientUser', '-userIsActivie -lastUserAccess -matches -__v');

        return res.status(200).json({'message': 'matchs fetched successfully', 'matchs': usersMatchRequestList});
    } 
    catch (error) 
    {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getUserReceiptMatchsRequests = async (req, res, next) => 
{
    try 
    {
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);
        const userID = user._id;

        if (!user) return res.status(422).json({'code': 'REQUIRED_FIELD_MISSING','description': 'Request User ID is required!'}); 
        
        let usersMatchRequestList = await Match.find({$and: [{_id: {$in: user.matches}}, {recipientUser: {$eq: userID}}, {status: {$eq: 1}}]})
                                          .populate('requesterUser', '-userIsActivie -lastUserAccess -__v');

        return res.status(200).json({userReceiptMatches: usersMatchRequestList});

    } 
    catch (error) 
    {
        console.log('Error in getUserReceiptMatchsRequests', error);
        return res.status(500);
    }
}

const sendNewMatchRequest = async (req, res, next) => 
{
    try 
    {
        const requesterUser = await Helper.getUserIdFromAuthenticatedRequest(req);
        const requesterUserID = requesterUser._id;

        if (requesterUser.matches.length >= Constants.maxMatchCount) return res.status(201).json({'requested': false,'status': 'fail'});
        
        const recipientUserID = mongoose.Types.ObjectId(req.body.recipientID);
        const receiveRequestUser = await User.findById(recipientUserID);

        // Check if a request for this user already exists
        let p0 = Match.findOne({
            "requesterUser": requesterUserID,
            "recipientUser": recipientUserID
        });
        let p1 = Match.findOne({
            "requesterUser": recipientUserID,
            "recipientUser": requesterUserID
        });

        const results = await Promise.all([p0, p1]);

        let matchUserAsRequester = results[0];
        let matchUserAsRecipient = results[1];

        if ((matchUserAsRecipient === null) && (matchUserAsRequester === null)) 
        {
            const temp = 
            {
                requesterUser: requesterUserID,
                recipientUser: recipientUserID,
                matchLanguage: req.body.matchLanguage
            };

            let newMatch = await Match.create(temp);

            User.findByIdAndUpdate(requesterUserID, {$push: {matches: newMatch._id}});
            User.findByIdAndUpdate(recipientUserID, {$push: {matches: newMatch._id}});
            
            emailServer.sendNewRequestNotificationEmail(requesterUser, receiveRequestUser);

            return res.status(200);
        }
        else return res.status(400);
    } 
    catch (error) 
    {
        console.log('Error in sendNewMatchRequest', error);
        return res.status(500);
    }
}

const acceptNewMatchRequest = async (req, res, next) => 
{
    try 
    {
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);

        if (user.matches.length >= Constants.maxMatchCount) return res.status(200);

        const matchId = req.params.matchId;
        const matchExists = await Match.findById(matchId);

        if (!matchExists) return res.status(404);

        let temp = 
        {
            status: 2,
            matchChatChanell: toString(matchExists.recipientUser + matchExists.requesterUser + Date.now()),
            matchStartDate: Date.now()
        }

        let updateMatch = await Match.findByIdAndUpdate(matchId, {$set: temp});

        console.log('Matching user...');

        if (updateMatch) 
        {
            // CREATE NEW CHAT ROOM
            let roomId = updateRequestUser.email + '|' + updateReceipUser.email;
            let roomVr = await Room.findOne({roomId: roomId});

            if (roomVr) throw new Error('Room already exists! Duplicated match request!', roomId);

            let p0 = User.findByIdAndUpdate(matchExists.requesterUser, {$push: {rooms: roomId}});
            let p1 = User.findByIdAndUpdate(matchExists.recipientUser, {$push: {rooms: roomId}});

            Room.create({roomId: roomId});

            let results = await Promise.all([p0, p1]);
            updateRequestUser = results[0];
            updateReceipUser = results[1];

            if (updateRequestUser && updateReceipUser) return res.status(200);
            else return res.status(500);
        }
        else throw new Error('Updated match not created.');
    } 
    catch (error) 
    {
        console.log('Error in accpetNewMatchRequest', error);
        return res.status(500);
    }
}

const denyMatchRequest = async (req, res, next) => 
{
    try 
    {
        const matchId = req.params.matchId;
        const matchExists = await Match.findById(matchId);

        if (!matchExists) return res.status(404);
        
        const temp = 
        {
            status: 3,
            matchEndDate: Date.now()
        }

        Match.findByIdAndUpdate(matchId, {$set: temp});
        return res.status(200);
    } 
    catch (error) 
    {
        return res.status(500);
    }
}

const getUserCurrentActiveMatches = async (req, res, next) => 
{
    try 
    {
        let user = await User.findOne({email: req.user.email});
        let userActiveMatchesList = await Match.find({$and: [{_id: {$in: user.matches}}, {status: {$eq: 2}}]});
        
        if (userActiveMatchesList) 
        {
            return res.status(200).json({
                'data': userActiveMatchesList,
                'userId': user._id
            });
        } 
        else return res.status(404).json({});
    } 
    catch (error) 
    {
        console.log('Error in getUserCurrentActiveMatches', error);
        return res.status(500);
    }
}


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

            const roomRemoved = await Room.findOne({roomId:roomId});
            if (roomRemoved != null) console.log('Room found!', roomRemoved);

            const user0UpdatedRooms = user0.rooms.filter(element => element !== roomId);
            const user1UpdatedRooms = user1.rooms.filter(element => element !== roomId);

            const user0UpdatedMatches = user0.matches.filter(element => element.toString() !== matchData.matchId);
            const user1UpdatedMatches = user1.matches.filter(element => element.toString() !== matchData.matchId);

            User.findByIdAndUpdate(
                user0._id,
                {rooms: user0UpdatedRooms,
                matches: user0UpdatedMatches});

            User.findByIdAndUpdate(
                user1._id,
                {rooms: user1UpdatedRooms,
                matches: user1UpdatedMatches});

            Match.findByIdAndRemove(match._id);

            Room.findOneAndRemove({roomId:roomId});

            res.status(200);
        }
        else 
        {
            console.log('Match does not exist!');
            res.status(500);
        }
    }
    catch (error)
    {
        console.log(error);
        res.status(500);
    }
}

module.exports = {
    getPossibleMatchUsers: getPossibleMatchUsers,
    sendNewMatchRequest: sendNewMatchRequest,
    getUserRequestedMatchsRequest: getUserRequestedMatchsRequest,
    getUserReceiptMatchsRequests: getUserReceiptMatchsRequests,
    acceptNewMatchRequest: acceptNewMatchRequest,
    denyMatchRequest: denyMatchRequest,
    getUserCurrentActiveMatches: getUserCurrentActiveMatches,
    removeExistingMatch:removeExistingMatch
}