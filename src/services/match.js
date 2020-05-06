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
const Logger = require('../logger');

const getPossibleMatchUsers = async (req, res, next) => 
{
    try 
    {
        console.log('Retrieving possible matches...');

        //Get user request informations
        const userInfo = await Helper.getUserLoggedInfoWithEmail(req);
        if (userInfo.excludeFromMatching) return res.status(200).json({'userPossibleMatches': []});

        // Get user informations to be used in search match database query
        const userLearnLanguages = userInfo.languagesToLearn;
        const userID = userInfo._id;

        let filterIds = [userID];
        let languagesList = [];

        Logger.write('match', `User ID for getPossibleMatchUsers request ${userID}`);

        if (userInfo.matches.length > Constants.maxMatchCount) return res.status(400).json({});

        for (i = 0; i < userInfo.matches.length; i++)
        {
            const match = await Match.findById(userInfo.matches[i]);

            if (match) filterIds.push(userID.equals(match.requesterUser) ? match.recipientUser : match.requesterUser);
        }

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
                'languagesToTeach.language': userLearnLanguages[i].language,
                '_id': {$nin: filterIds},
                'excludeFromMatching': false
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
            sendArrayFormated[j].matches.sort((e0, e1) => e1.fitQuality - e0.fitQuality);

        return res.status(200).json({'userPossibleMatches': sendArrayFormated});
    } 
    catch (error) 
    {
        Logger.write('match', `Error inside getPossibleMatchUsers ${error}`, 2);

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
        Logger.write('match', `Error inside getUserRequestedMatchsRequest ${error}`, 2);

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
                                          .populate('requesterUser', '-userIsActivie -lastUserAccess -__v -password -matches -rooms -_id -isAdmin -userIsActive');

        return res.status(200).json({userReceiptMatches: usersMatchRequestList});

    } 
    catch (error) 
    {
        Logger.write('match', `Error inside getUserReceiptMatchsRequests ${error}`, 2);

        return res.status(500).json({});
    }
}

const sendNewMatchRequest = async (req, res, next) => 
{
    try 
    {
        const requesterUser = await Helper.getUserIdFromAuthenticatedRequest(req);
        const requesterUserID = requesterUser._id;

        if (requesterUser.matches.length > Constants.maxMatchCount) return res.status(400).json({});
        
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

            p0 = User.findByIdAndUpdate(requesterUserID, {$push: {matches: newMatch._id}});
            p1 = User.findByIdAndUpdate(recipientUserID, {$push: {matches: newMatch._id}});
            
            emailServer.sendNewRequestNotificationEmail(requesterUser, receiveRequestUser);

            await Promise.all([p0, p1]);

            return res.status(200).json({});
        }
        else return res.status(400).json({});
    } 
    catch (error) 
    {
        Logger.write('match', `Error inside sendNewMatchRequest ${error}`, 2);

        return res.status(500);
    }
}

const acceptNewMatchRequest = async (req, res, next) => 
{
    try 
    {
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);

        if (user.matches.length > Constants.maxMatchCount) return res.status(400).json({});

        const matchId = req.params.matchId;
        const matchExists = await Match.findById(matchId);

        if (!matchExists) return res.status(404).json({});

        let temp = 
        {
            status: 2,
            matchChatChanell: toString(matchExists.recipientUser + matchExists.requesterUser + Date.now()),
            matchStartDate: Date.now()
        }

        let updateMatch = await Match.findByIdAndUpdate(matchId, {$set: temp});

        if (updateMatch) 
        {
            let p0 = await User.findById(matchExists.requesterUser);
            let p1 = await User.findById(matchExists.recipientUser);
            let results = await Promise.all([p0, p1]);

            let user0 = results[0];
            let user1 = results[1];

            p0 = Room.findOne({user0:user0.email, user1:user1.email});
            p1 = Room.findOne({user0:user1.email, user1:user0.email});
            results = await Promise.all([p0, p1]);

            if (results[0] || results[1]) throw new Error('Room already exists! Duplicated match request!');

            const room = await Room.create({user0:user0.email, user1:user1.email});

            p0 = User.findByIdAndUpdate(matchExists.requesterUser, {$push: {rooms: room._id}});
            p1 = User.findByIdAndUpdate(matchExists.recipientUser, {$push: {rooms: room._id}});

            results = await Promise.all([p0, p1]);
            user0 = results[0];
            user1 = results[1];

            if (user0 && user1) return res.status(200).json({});
            else return res.status(500).json({});
        }
        else throw new Error('Updated match not created.');
    } 
    catch (error) 
    {
        Logger.write('match', `Error inside acceptNewMatchRequest ${error}`, 2);

        return res.status(500).json({});
    }
}

const denyMatchRequest = async (req, res, next) => 
{
    try 
    {
        const matchId = req.params.matchId;
        const match = await Match.findById(matchId);

        if (!match) return res.status(404);
        
        removeMatchHelper(match);

        return res.status(200).json({});
    } 
    catch (error) 
    {
        Logger.write('match', `Error inside denyMatchRequest ${error}`, 2);

        return res.status(500).json({});
    }
}

const getUserCurrentActiveMatches = async (req, res, next) => 
{
    try 
    {
        let user = await User.findOne({email: req.user.email});
        let userActiveMatchesList = await Match.find({$and: [{_id: {$in: user.matches}}, {status: {$eq: 2}}]})
        .populate('requesterUser', '-password').populate('recipientUser', '-password -matches -rooms -_id -isAdmin -userIsActive');

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
        Logger.write('match', `Error inside getUserCurrentActiveMatches ${error}`, 2);

        return res.status(500).json({});
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
            removeMatchHelper(match);

            return res.status(200).json({});
        }
        else 
        {
            console.log('Match does not exist!');
            return res.status(500).json({});
        }
    }
    catch (error)
    {
        Logger.write('match', `Error inside removeExistingMatch ${error}`, 2);

        return res.status(500).json({});
    }
}

const removeMatchHelper = async(match) =>
{
    try
    {
        Logger.write('match', `Removing match: ${match._id}`);

        let p0 = User.findById(match.requesterUser);
        let p1 = User.findById(match.recipientUser);
        let results = await Promise.all([p0, p1]);

        const user0 = results[0];
        const user1 = results[1];

        //console.log('[MATCH] Removing match between:', user0.email, user1.email);

        p0 = Room.findOne({user0:user0.email, user1:user1.email});
        p1 = Room.findOne({user0:user1.email, user1:user0.email});
        results = await Promise.all([p0, p1]);

        const room = !results[0] ? results[1] : results[0];
        const roomId = room ? room._id : undefined;

        //console.log('[MATCH] user rooms', user0.matches, match._id, match._id !== user0.matches[0]);

        const user0UpdatedRooms = room ? user0.rooms.filter(element => element.toString() !== roomId.toString()) : user0.rooms;
        const user1UpdatedRooms = room ? user1.rooms.filter(element => element.toString() !== roomId.toString()) : user1.rooms;

        const user0UpdatedMatches = user0.matches.filter(element => element.toString() !== match._id.toString());
        const user1UpdatedMatches = user1.matches.filter(element => element.toString() !== match._id.toString());

        //console.log('[MATCH] user rooms', user0UpdatedMatches, match._id);

        User.findByIdAndUpdate(
            user0._id,
            {rooms: user0UpdatedRooms,
            matches: user0UpdatedMatches}).exec();

        User.findByIdAndUpdate(
            user1._id,
            {rooms: user1UpdatedRooms,
            matches: user1UpdatedMatches}).exec();

        Match.findByIdAndRemove(match._id).exec();

        if (room) Room.findOneAndRemove({_id:roomId}).exec();
    }
    catch (error)
    {
        Logger.write('match', `Error inside removeMatchHelper ${error}`, 2);
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