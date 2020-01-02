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

//TODO -> CHANGE THIS TO BE A REFERENCE OF CONSTANT UNIVERSITIES FILE
const universities = {
    "tuni.fi":"Tampere Universities",
    "test.fi":"Test Universities",
    "test2.fi":"Test Universities 2",
};

const getUserUniversityWithEmail= async (email) => {
    let userUniversity = "";
    let emailDomain = email.replace(/.*@/, "");
    
    userUniversity = universities[emailDomain]

    return userUniversity;
}




module.exports = {
    getUserIdFromAuthenticatedRequest: getUserIdFromAuthenticatedRequest,
    getUserInfoWithEmail:getUserInfoWithEmail,
    getUserLoggedInfoWithEmail:getUserLoggedInfoWithEmail,
    getUserUniversityWithEmail:getUserUniversityWithEmail
}