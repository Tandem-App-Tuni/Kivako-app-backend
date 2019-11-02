const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');




//
const isAuthenticated = async (req, res, next) => {
    //let userlog = true;
    let userlog = req.isAuthenticated();// If testing api use the other variable

    if(userlog == true){
        return next();
    }else{
        res.status(400).json({
            'message': 'access denied'
        });
    }
    
}

// TODO use this function to verify if the user making the request is the same that is performing some action in system and authorized
const isRequestUserAutheticatedAndValid = async (req, res, next) => {

    //MAYBE CHANGE PARAMETERS OF THE API
    //let userlog = true;
    let userlog = req.isAuthenticated();

    console.log(req.session.passport.user.email)

    if(userlog == true){
        return next();
    }else{
        res.status(400).json({
            'message': 'access denied'
        });
    }
    
}

module.exports = {
    isAuthenticated: isAuthenticated,
    isRequestUserAutheticatedAndValid:isRequestUserAutheticatedAndValid
}