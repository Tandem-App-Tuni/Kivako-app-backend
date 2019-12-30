const User = require('../models/user');
const session = require('express-session');
const UniversityList = require('./constants/universities')

const getUserLoggedInfoWithEmail = async (req, res, next) => {
    //const email = req.session.passport.user.email;
    const email =  req.user.email;//"dell@tuni.fi"//"jpns@tuni.fi";//"jbl@tuni.fi"

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

const getUserUniversityWithEmail= async (email) => {
    let userUniversity = "";
    let emailDomain = email.replace(/.*@/, "");

    userUniversity = searchByKey(UniversityList, emailDomain);

    return userUniversity;
}

function searchByKey(object, key) {
    return object[key];
}



module.exports = {
    getUserIdFromAuthenticatedRequest: getUserIdFromAuthenticatedRequest,
    getUserInfoWithEmail:getUserInfoWithEmail,
    getUserLoggedInfoWithEmail:getUserLoggedInfoWithEmail,
    getUserUniversityWithEmail:getUserUniversityWithEmail
}