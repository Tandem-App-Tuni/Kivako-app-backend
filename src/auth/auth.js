const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const User = require('../models/user');

// File to hender auxiliar functions related to authentication of the user


// Check if user that made the requisition is logged in the system.
// Used as protection for the API's in the server
const isAuthenticated = async (req, res, next) => {
    let userlog = true; // If testing just requisitions,without been logged, use this variable instead of the other
    //let userlog = req.isAuthenticated();

    //console.log("here");
    //console.log(req.session.passport.user.email)

    //console.log('Checking authentication...');
    //console.log(req.session);

    if(userlog == true){
        return next();
    }else{
        res.status(400).json({
            'message': 'access denied'
        });
    }
    
}

// Check if user that made the requisition is logged in the system and if the user is an admin.
// Used as protection for the API's in the server
const checkIfUserIsAuthenticatedAndAdmin = async (req, res, next) => {
    const user =  await User.findOne({
        "email": req.user.email
    });
    const isAdmin = user.isAdmin;

    if(!req.isAuthenticated() || !isAdmin){
        res.status(400).json({
            'message': 'Acess Denied! You must been an Admin User or been logged to access this page!'
        });
    }else{
        return next();   
    }
    
}

// Check if user that made the requisition is logged in the system.
// Used as protection for the API's in the server
// TODO -> Method will protect api's that can be accessed just by some users.
const isRequestUserAutheticatedAndValid = async (req, res, next) => {

    let userlog = true;
    //let userlog = req.isAuthenticated();
    //console.log("log2")
    //console.log(req.session.passport.user.email)

    if(userlog == true){true
        return next();
    }else{
        res.status(400).json({
            'message': 'access denied'
        });
    }
    
}




module.exports = {
    isAuthenticated: isAuthenticated,
    isRequestUserAutheticatedAndValid:isRequestUserAutheticatedAndValid,
    checkIfUserIsAuthenticatedAndAdmin:checkIfUserIsAuthenticatedAndAdmin
}