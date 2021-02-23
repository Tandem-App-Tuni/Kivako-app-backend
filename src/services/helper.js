const User = require('../models/user');
const session = require('express-session');
const UniversityList = require('./constants/universities')

const characters = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz1234567890$-_.+!*()';
const nCharacters = characters.length;
const keyLength = 5;

var crypto = require('crypto');

const getUserLoggedInfoWithEmail = async (req, res, next) => {
    const email = req.user.email;

    let isEmailExists = await User.findOne({
        "email": email
    });

    return isEmailExists;
}

const getUserIdFromAuthenticatedRequest = async (req, res, next) => {
    const email = req.user.email;

    let isEmailExists = await User.findOne({
        "email": email
    });

    return isEmailExists;
}

const getUserInfoWithEmail = async (req, res, next) => {
    const email = req.params.email

    let user = await User.findOne({
        "email": email
    });

    return user;
}

function generateRandomActivationKey(userId)
{
    let generatedKey = '';
    for (i = 0; i < keyLength; i++) generatedKey += characters.charAt(Math.floor(Math.random() * (nCharacters - 1)));

    let shasum = crypto.createHash('sha1');
    shasum.update(userId + generatedKey);

    return shasum.digest('hex');
}

module.exports = {
    getUserIdFromAuthenticatedRequest: getUserIdFromAuthenticatedRequest,
    getUserInfoWithEmail: getUserInfoWithEmail,
    getUserLoggedInfoWithEmail: getUserLoggedInfoWithEmail,
    generateRandomActivationKey:generateRandomActivationKey
}