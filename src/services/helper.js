const User = require('../models/user');
const session = require('express-session');

const getUserLoggedInfoWithEmail = async (req, res, next) => {
    const email = req.session.passport.user.email;

    let isEmailExists = await User.findOne({
        "email": email
    });

    return isEmailExists;
}

const getUserIdFromAuthenticatedRequest = async (req, res, next) => {
    const email = req.session.passport.user.email;

    let isEmailExists = await User.findOne({
        "email": email
    });

    return isEmailExists._id;
}

const getUserInfoWithEmail = async (req, res, next) => {
    const email = req.params.email

    let user = await User.findOne({
        "email": email
    });

    return user;
}


module.exports = {
    getUserIdFromAuthenticatedRequest: getUserIdFromAuthenticatedRequest,
    getUserInfoWithEmail:getUserInfoWithEmail,
    getUserLoggedInfoWithEmail:getUserLoggedInfoWithEmail
}