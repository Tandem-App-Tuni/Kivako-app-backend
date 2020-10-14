/********
 * user.js file (services/users)
 ********/
const User = require('../models/user');
const Match = require('../models/match');
const Room = require('../models/room');
const ResetPassword = require('../models/resetPassword');

var passwordHash = require('password-hash');

const Helper = require('./helper')
const EmailDomains = require('../emailDomains');
const fs = require('fs');
const path = require('path');
const constants = require('../configs/constants');
const emailServer = require('../emailServer');
const crypto = require('crypto');

const Logger = require('../logger');

const checkIfUserAlreadyRegistered = async (req, res, next) => {

    try {
        if (req.user.email) {
            const email = req.user.email;

            let isEmailExists = await User.findOne({
                "email": email
            });

            if (isEmailExists != null) {
                Logger.write('user', `User ${req.user.email} is already registered.`);
                
                return res.status(200).json({
                    'isRegistered': true,
                    'email': email,
                    'isAdmin': isEmailExists.isAdmin
                });
            } else {
                Logger.write('user', `User ${req.user.email} is not registered.`);
                return res.status(200).json({
                    'isRegistered': false
                });
            }
        } else {
            Logger.write('user', `User ${req.user.email} is not registered.`);
            return res.status(201).json({
                'isRegistered': false
            });
        }


    } 
    catch (error) {
        //console.log("[ERROR]Error during check if user " + req.user.email + " is already registered!");
        Logger.write('user', `Error inside checkIfUserAlreadyRegistered ${error}`, 2);

        return res.status(404).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getUserInformation = async (req, res, next) => {
    try {
        //If the query string contains the userEmail parameter, we will fetch the info of that user
        //Otherwise, info for loggedin user will be fetched
        const email = req.query.userEmail ? req.query.userEmail : req.user.email;
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

        Logger.write('user', `Error inside getUserInformation ${error}`, 2);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const isAdmin = async(req, res, next) =>
{
    try
    {
        if (!req.user) res.status(200).json({isAdmin:false});
        else
        {
            const user = await User.findOne({email:req.user.email});

            if (user) res.status(200).json({isAdmin:user.isAdmin});
            else res.status(200).json({isAdmin:false});
        }
    }
    catch(error)
    {
        Logger.write('user', `Error inside isAdmin ${error}`, 2);

        res.status(200).json({isAdmin:false});
    }
}

function validEmail(email)
{
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    .test(email);
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
        if (!validEmail(email))
        {
            Logger.write('user', `Invalid email address ${email}`, 1);

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
            Logger.write('user', `Invalid domain ${domainFlag}`, 1);

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

        const temp = 
        {
            firstName: firstName,
            lastName: lastName,
            email: email,
            activationKey: activationKey,
            activationStamp: new Date(),
            cities: cities,
            descriptionText: descriptionText ? descriptionText : 'No description.',
            languagesToTeach: languagesToTeach,
            languagesToLearn: languagesToLearn,
            userIsActivie: userIsActivie,
            isActivated: false,
            isAdmin: false,
            excludeFromMatching: true,
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
        Logger.write('user', `Error inside createUser ${error}`, 2);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'Something went wrong, Please try again and make sure all the fields are filled in!'
        });
    }
}

const resetPasswordRequestCheck = async (req, res, next) =>
{
    try
    {
        const email = req.body.email;
        const token = req.body.token;

        const resetForm = await ResetPassword.findOne({id:email, token:token});

        if (resetForm !== null)
        {
            const hashedPassword = passwordHash.generate(req.body.password);
            
            User.findOneAndUpdate({email:email}, {password:hashedPassword}, (err) => 
            {
                if (err) 
                {
                    console.log('Error reseting password', err);
                    Logger.write('user', `Error reseting password ${err}`, 2);

                    res.status(500).json({});
                }
                else 
                {
                    ResetPassword.findOneAndRemove({email:email}, (err) =>
                    {
                        if (err) Logger.write('user', `Error removing reset password form ${err}`, 2);
                    });

                    res.status(200).json({});
                }
            });
        }
        else res.status(500).json({});
    }
    catch (err)
    {
        Logger.write('user', `Error inside resetPasswordRequestCheck ${err}`, 2);

        return res.status(500).json({});
    }
}

const resetPasswordRequest = async (req, res, next) =>
{
    try
    {
        let email = req.path.split('/');
        email = email[email.length - 1];

        if (validEmail(email))
        {
            const user = await User.findOne({email:email});

            if (user)
            {
                const form = await ResetPassword.findOne({id: email});
                const token = crypto.randomBytes(8).toString('hex');

                if (form && (new Date() - form.timestamp) >= 1)
                {
                    await ResetPassword.findOneAndUpdate({id:email}, {timestamp: new Date(), token:token}, err => 
                    {
                        if (err) Logger.write('user', `Error updating password reset token ${err}`, 2);
                    });
                }
                else
                {
                    await ResetPassword.create({id:email,token:token,timestamp:new Date()}, err => 
                    {
                        if (err) Logger.write('user', `Error creating password reset token ${err}`, 2);
                    });
                }

                emailServer.sendPasswordResetEmail(user, token);

                return res.status(200).json({message:'Success'});
            }
            else 
            {
                Logger.write('user', `Error inside resetPasswordRequest. User with email ${email} not found.`, 2);

                return res.status(500).json({message:'Error'});
            }
        }
    }
    catch (error)
    {
        Logger.write('user', `Error inside resetPasswordRequest ${error}`, 2);

        return res.status(500).json({message:'Error'});
    }
}

const activateUser = async (req, res, next) => 
{
    try
    {
        let activationKey = req.path.split('/');
        activationKey = activationKey[activationKey.length - 1];
        
        Logger.write('user', `Activation request for key: ${activationKey}`);

        let user = await User.findOne({activationKey: activationKey});

        if (user)
        {
            Logger.write('user', `User is activated ${user.isActivated}`);

            if (user.isActivated) 
            {
                res.redirect(constants.frontEndURL + '/local-login');
                return;
            }

            User.findByIdAndUpdate(user._id, {isActivated: true, excludeFromMatching: false}, (err) => 
            {
                if (err) Logger.write('user', `Error activating user ${error}`, 2);
            });
            res.redirect(constants.frontEndURL + '/local-login');
        }
        else
        {
            Logger.write('user', `User not found...invalid activaiton key...key: ${activationKey}`, 1);
            res.redirect(constants.frontEndURL + '/local-login');
        }
    }
    catch(error)
    {
        Logger.write('user', `Error inside activateUser ${error}`, 2);

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

                User.findByIdAndUpdate(user._id, {activationKey: activationKey, activationStamp: new Date()}, error => 
                {
                    if (error)
                    {
                        Logger.write('user', `Error updating user information while reactivating ${error}`, 2);
                        res.status(404).json({message: 'Error while activating.'});
                    }
                    else res.status(200).json({message: 'Activation link resent.'});
                });
            }
        });
    }
    catch(error)
    {
        Logger.write('user', `Error occured when trying to resend an activaion link: ${error}`, 2);
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
            userIsActivie, 
            profileVideoURL
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
            descriptionText: descriptionText ? descriptionText : 'Hello there.',
            languagesToTeach: languagesToTeach,
            languagesToLearn: languagesToLearn,
            userIsActivie: userIsActivie,
            profileVideoURL:profileVideoURL
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
    } 
    catch (error) 
    {
        Logger.write('user', `Error inside updateUser ${error}`, 2);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'Something went wrong, Please try again and make sure every field is filled in!'
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
        helperDeleteUser(req.user.email)
        .then(result => 
        {
            Logger.write('user', `Deletion result: ${result}`);

            if (result === 0)
            {
                req.logout();
                req.session.destroy();

                return res.status(200).json(
                {
                    code: 'REMOVAL_SUCCESSFUL',
                    description: 'User removed.'
                });
            }
            else
            {
                return res.status(500).json({
                    'code': 'SERVER_ERROR',
                    'description': 'something went wrong, Please try again'
                });
            }
        });
    }
    catch(error)
    {
        Logger.write('user', `Error inside deleteUser ${error}`, 2);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const adminDeleteUser = async (req, res, next) =>
{
    try
    {
        let adminUser = req.user.email;
        adminUser = await User.findOne({email:adminUser});

        if (adminUser !== undefined && adminUser.isAdmin)
        {
            let userEmail = req.path.split('/');
            userEmail = userEmail[userEmail.length - 1];

            Logger.write('user', `Removing user: ${userEmail}`);

            helperDeleteUser(userEmail)
            .then(result => 
            {
                if (result === 0) return res.status(200).json({
                                    code: 'REMOVAL_SUCCESSFUL',
                                    description: 'User removed.'
                                });
                else return res.status(500).json({
                    'code': 'SERVER_ERROR',
                    'description': 'something went wrong, Please try again'
                });
            });
        }
        else return res.status(500).json({
                'code': 'SERVER_ERROR',
                'description': 'something went wrong, Please try again'
            });
    }
    catch(error)
    {
        Logger.write('user', `Error inside adminDeleteUser ${error}`, 2);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const helperDeleteUser = async (email) =>
{
    try 
    {
        Logger.write('user', `Removing profile ${email}`);

        let user = await User.findOne({'email': email});
        let matches = await Match.find({'_id': {$in: user.matches}});
        let rooms = await Room.find({'_id': {$in: user.rooms}});

        Logger.write('user', `Total number of rooms ${rooms ? rooms.length : 0}!`);

        for (i = 0; i < matches.length; i++)
        {
            let match = matches[i];

            let secondUser;

            if (match.requesterUser.equals(user._id)) secondUser = match.recipientUser;
            else if (match.recipientUser.equals(user._id)) secondUser = match.requesterUser;
            
            secondUser = await User.findById(secondUser).exec();
            Logger.write('user', `Second user: ${secondUser.email}`);

            let room = undefined;
            let fuId = user.email;
            let suId = secondUser.email;
            for (let tmpRoom of rooms)
            {
                Logger.write('user', `Checking room: ${tmpRoom.user0} ${tmpRoom.user1}`);

                let user0 = tmpRoom.user0;
                let user1 = tmpRoom.user1;

                if ((user0 === fuId && user1 === suId) || (user1 === fuId && user0 === suId))
                {
                    room = tmpRoom;
                    break;
                }
            }

            if (room) Logger.write('user', `Room: ${room.user0} ${room.user1}`);
            
            let postMatches = secondUser.matches.filter(id => !id.equals(match._id));
            let postRooms = room !== undefined ? secondUser.rooms.filter(id => id !== (room._id.toString())) : secondUser.rooms;

            await User.findByIdAndUpdate(secondUser._id, {rooms: postRooms, matches: postMatches}, (err) => 
            {
                if (err) Logger.write('user', `Error updating user ${secondUser.email} when removing user ${email}: ${err}`, 2);
            });

            await Match.findByIdAndRemove(match._id, (err) => 
            {
                if (err) Logger.write('user', `Error removing match between users ${email} ${secondUser.email}: ${err}`, 2);
            });
            
            if (room !== undefined)
            {
                Logger.write('user', `Removing room!`);

                await Room.findByIdAndRemove(room._id, (err) => 
                {
                    if (err) Logger.write('user', `Error removing room ${room.roomId}: ${err}`, 2);
                });
            }
        }

        let avatar = path.join(constants.uploadsFolder, email);
        if (fs.existsSync(avatar)) fs.unlink(avatar, (err) => 
        {
            if (err) Logger.write('user', `Error removing avatar ${avatar}: ${err}`, 2);
        });

        let flag = 0;

        await User.findByIdAndRemove(user._id, (err) => 
        {
            if (err)
            {
                Logger.write('user', `Error removing user ${user.email}: ${err}`, 2);

                flag = 1;
            }
        });

        return flag;
    } 
    catch (error) 
    {
        Logger.write('user', `Error inside helperDeleteUser ${error}`, 2);

        return 2;
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
        Logger.write('user', `Error inside loadUserInfoMenuDrawer ${error}`, 2);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const setMatchingVisibility = async (req, res, next) =>
{
    try
    {
        let flag = req.body.flag;
        if (flag !== undefined)
        {
            await User.findOneAndUpdate({email:req.user.email}, {excludeFromMatching: flag});
            return res.status(200).json({ excludeFromMatching: flag });
        } 
        else return res.status(500).json({});
    }
    catch(error)
    {
        Logger.write('user', `Error inside setMatchingVisibility ${error}`, 2);
        return res.status(500).json({});
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
    reactivateUser:reactivateUser,
    isAdmin:isAdmin,
    adminDeleteUser:adminDeleteUser,
    resetPasswordRequest:resetPasswordRequest,
    resetPasswordRequestCheck:resetPasswordRequestCheck,
    helperDeleteUser:helperDeleteUser,
    setMatchingVisibility:setMatchingVisibility
}