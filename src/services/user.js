/********
 * user.js file (services/users)
 ********/
const User = require('../models/user');
const Match = require('../models/match');
const Room = require('../models/room');
var passwordHash = require('password-hash');
const Helper = require('./helper')
const EmailDomains = require('../emailDomains');
const fs = require('fs');
const path = require('path');
const constants = require('../configs/constants');
const emailServer = require('../emailServer');

const checkIfUserAlreadyRegistered = async (req, res, next) => {

    try {
        if (req.user.email) {
            const email = req.user.email;

            let isEmailExists = await User.findOne({
                "email": email
            });

            if (isEmailExists != null) {
                console.log("[INFO]User " + req.user.email + " is already registered!");
                return res.status(200).json({
                    'isRegistered': true,
                    'email': email,
                    'isAdmin': isEmailExists.isAdmin
                });
            } else {
                console.log("[INFO]User " + req.user.email + " is not registered!");
                return res.status(200).json({
                    'isRegistered': false
                });
            }
        } else {
            console.log("[INFO]User " + req.user.email + " is not registered!");
            return res.status(201).json({
                'isRegistered': false
            });
        }


    } catch (error) {
        //console.log("[ERROR]Error during check if user " + req.user.email + " is already registered!");
        return res.status(404).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getUserInformation = async (req, res, next) => {
    try {

        const email = req.user.email;
        let user = await User.findOne({
            "email": email
        });

        if (user) {
            return res.status(200).json({
                'message': `User informations fetched successfully`,
                'data': user
            });
        }

        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found in the system'
        });

    } catch (error) {

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const createUser = async (req, res, next) => 
{
    try {
        const {
            firstName,
            lastName,
            email,
            cities,
            descriptionText,
            languagesToTeach,
            languagesToLearn,
            userIsActivie,
            isAdmin,
            password
        } = req.body;


        if (email === undefined || email === '') 
        {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'Email is required!',
                'field': 'email'
            });
        }

        /**
         * Check if the email provided is from the correct domain.
         * First check if the email is a valid email address.
         * The following regex checks for approximate string validity.
         * The regex is available on https://emailregex.com/.
         */
        if (!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        .test(email))
        {
            console.log('Invalid email address!');
            return res.status(422).json({
                'code': 'INVALID_EMAIL_ADDRESS',
                'description': 'Email address is not valid!',
                'field': 'email'
            });
        }

        let domainFlag = false;
        for (i = 0; i < EmailDomains.domains.domains.length; i++)
        {
            const domain = EmailDomains.domains.domains[i];
            
            if (email.endsWith(domain))
            {
                domainFlag = true;
                break;
            }
        }

        if (!domainFlag)
        {
            console.log('Invalid domain!');

            return res.status(422).json({
                'code': 'INVALID_EMAIL_DOMAIN',
                'description': 'Email domain is not allowed!',
                'field': 'email'
            });
        }

        if (password == undefined || password.length < 6)
        {
            return res.status(422).json(
            {
                'code': 'PASSWORD_TOO_SHORT',
                'description': 'Password has to be longer than 5 characters.',
                'field': 'password'
            });
        }

        let isEmailExists = await User.findOne({
            "email": email
        });


        if (isEmailExists) {
            return res.status(409).json({
                'code': 'ENTITY_ALREAY_EXISTS',
                'description': 'Email already exists!',
                'field': 'email'
            });
        }


        let hashedPassword = passwordHash.generate(password);

        let activationKey = Helper.generateRandomActivationKey();

        const temp = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            activationKey: activationKey,
            activationStamp: new Date(),
            cities: cities,
            descriptionText: descriptionText,
            languagesToTeach: languagesToTeach,
            languagesToLearn: languagesToLearn,
            userIsActivie: userIsActivie,
            isAdmin: false,
            password: hashedPassword,
        };

        let newUser = await User.create(temp);

        emailServer.sendActivationEmail(
        {
            email: email, 
            firstName: temp.firstName,
            lastName: temp.lastName
        }, constants.backEndUrl + '/api/v1/users/activate/' + activationKey);

        if (newUser) {
            return res.status(201).json({
                'userAdded': true
            });
        } else {
            throw new Error('something went worng');
        }
    } catch (error) 
    {
        console.log(error);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const activateUser = async(req, res, next) =>
{
    try
    {
        let activationKey = req.path.split('/');
        activationKey = activationKey[activationKey.length - 1];
        
        console.log('Activation request for key:', activationKey);

        let user = await User.findOne({activationKey: activationKey});

        if (user)
        {
            console.log('User is activated:', user.isActivated);

            if (user.isActivated) 
            {
                res.redirect(constants.frontEndURL + '/local-login');
                return;
            }

            User.findByIdAndUpdate(user._id, {isActivated: true}, (err) => 
            {
                if (err) console.log('Error activating user', user.email);
            });
            res.redirect(constants.frontEndURL + '/local-login');
        }
        else
        {
            console.log('User not found...invalid activaiton key...report this to the maintainer -> key:', activationKey);
            res.redirect(constants.frontEndURL + '/local-login');
        }
    }
    catch(error)
    {
        console.log(error);

        res.status(500).json(
        {
            message: 'An error occured. Pleasy try again later!'
        });
    }
}

const reactivateUser = async(req, res, next) =>
{
    try
    {
        let email = req.path.split('/');
        email = email[email.length - 1];

        User.findOne({email: email})
        .then(user => 
        {
            if (!user || (user.isActivated || ((new Date() - user.activationStamp) < 1))) res.status(404).json({message: 'Error while activating.'});
            else 
            {
                let activationKey = Helper.generateRandomActivationKey();
                emailServer.sendActivationEmail(
                {
                    email: user.email, 
                    firstName: user.firstName,
                    lastName: user.lastName
                }, constants.backEndUrl + '/api/v1/users/activate/' + activationKey);

                User.findByIdAndUpdate(user._id, {activationKey: activationKey, activationStamp: new Date}, error => 
                {
                    if (error)
                    {
                        console.log('Error updating user information while reactivating', error);
                        res.status(404).json({message: 'Error while activating.'});
                    }
                    else res.status(200).json({message: 'Activation link resent.'});
                });
            }
        });
    }
    catch(error)
    {
        console.log('Error occured when trying to resend an activaion link:', error);
        res.status(404).json({message: 'Error while activating.'});
    }
}

const updateUser = async (req, res, next) => 
{
    try 
    {
        const userEmail = req.user.email;

        let user = await User.findOne({
            "email": userEmail
        });

        const userId = user._id;

        const {
            firstName,
            lastName,
            email,
            cities,
            descriptionText,
            languagesToTeach,
            languagesToLearn,
            userIsActivie
        } = req.body;

        let isUserExists = await User.findById(userId);

        if (!isUserExists) {
            return res.status(404).json({
                'code': 'BAD_REQUEST_ERROR',
                'description': 'No user found in the system'
            });
        }

        const temp = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            cities: cities,
            descriptionText: descriptionText,
            languagesToTeach: languagesToTeach,
            languagesToLearn: languagesToLearn,
            userIsActivie: userIsActivie
        }

        let updateUser = await User.findByIdAndUpdate(userId, temp, {
            new: true // TODO REMOVE THIS
        });

        if (updateUser) {
            return res.status(200).json({
                'update': true,
                'data': updateUser
            });
        } else {
            throw new Error('something went worng');
        }
    } catch (error) {

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

/**
 * Find all user matches and rooms.
 * Delete the matches and rooms and also delete the
 * matches from the second user in the partnership as well 
 * as the rooms. The avatar is also deleted.
 */
const deleteUser = async (req, res, next) => 
{
    try 
    {
        const email = req.user.email;
        let user = await User.findOne({'email': email});
        let matches = await Match.find({'_id': {$in: user.matches}});
        let rooms = await Room.find({'roomId': {$in: user.rooms}});

        for (i = 0; i < matches.length; i++)
        {
            let match = matches[i];

            let secondUser;

            if (match.requesterUser.equals(user._id)) secondUser = match.recipientUser;
            else if (match.recipientUser.equals(user._id)) secondUser = match.requesterUser;
            
            secondUser = await User.findById(secondUser).exec();
            
            let postMatches = secondUser.matches.filter(id => !id.equals(match._id));
            let postRooms = secondUser.rooms.filter(id => !id.includes(email));

            console.log(secondUser.matches, secondUser.rooms);
            console.log(postMatches, postRooms);

            await User.findByIdAndUpdate(secondUser._id, {rooms: postRooms, matches: postMatches}, (err) => 
            {
                if (err) console.log('Error updating user', secondUser.email, 'when removing user', email, err);
            });

            await Match.findByIdAndRemove(match._id, (err) => 
            {
                if (err) console.log('Error removing match between users', email, secondUser.email, err);
            });

            await Room.findByIdAndRemove(rooms[i]._id, (err) => 
            {
                if (err) console.log('Error removing room', rooms[i].roomId, err);
            });
        }

        let avatar = path.join(constants.uploadsFolder, email);
        if (fs.existsSync(avatar)) fs.unlink(avatar, (err) => 
        {
            if (err) console.log('Error removing the avatar', avatar, err);
        });

        await User.findByIdAndRemove(user._id, (err) => 
        {
            if (err)
            {
                console.log('Error removing user', user.email, err);

                return res.status(500).json(
                {
                    code: 'SERVER_ERROR',
                    description: 'Something went wrong. Please try again later.'
                });
            }
            else
            {
                req.logout();
                req.session.destroy();

                return res.status(200).json(
                {
                    code: 'REMOVAL_SUCCESSFUL',
                    description: 'User removed.'
                });
            }
        });
    } 
    catch (error) 
    {
        console.log(error);
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const loadUserInfoMenuDrawer = async (req, res, next) => {
    try {
        const user = await Helper.getUserIdFromAuthenticatedRequest(req);
        const userID = user._id;

        // Check in each learn language the possible matchs, and save this users in a list

        let numberOfRequests = await Match.countDocuments({
            "recipientUser": {
                $eq: userID
            },
            "status": {
                $eq: 1
            }
        });
        let currentActiveMatchesReceip = await Match.countDocuments({
            "recipientUser": {
                $eq: userID
            },
            "status": {
                $eq: 2
            }
        });
        let currentActiveMatchesRequest = await Match.countDocuments({
            "requesterUser": {
                $eq: userID
            },
            "status": {
                $eq: 2
            }
        });


        return res.status(200).json({
            // Create data section with language as key value of the users
            'numberOfRequests': numberOfRequests,
            'activeMatches': currentActiveMatchesReceip + currentActiveMatchesRequest,

        });

    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}


module.exports = {
    getUserInformation: getUserInformation,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    checkIfUserAlreadyRegistered: checkIfUserAlreadyRegistered,
    loadUserInfoMenuDrawer: loadUserInfoMenuDrawer,
    activateUser:activateUser,
    reactivateUser:reactivateUser
}