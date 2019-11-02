/********
* match.js file (services/matchs)
********/
const express = require('express');
const User = require('../models/user');
const Helper = require('./helper');

// TODO, CRIAR ARQUIVO DE TESTE
const getPossibleMatchUsers = async (req, res, next) => { // TODO, APPLY SELECT FILTER TO JUST RETURN SOME INFO
    try {

        //Get user request informations
        const userInfo = await Helper.getUserInfoWithEmail(req);
        
        // Get user informations to be used in search match database query
        let userLearnLanguages = userInfo.languagesToLearn;
        let userID = userInfo._id;
        
        let usersList = [];
        let languagesList = [];

        // Check in each learn language the possible matchs, and save this users in a list
        for (i = 0; i < userLearnLanguages.length; i++) {
            
            languagesList.push(userLearnLanguages[i].language);
            // Get all users that match, but not the user that made the request
            // $ne -> mongodb query that mean Not Equals.
            let users = await User.find({"languagesToTeach.language":userLearnLanguages[i].language, "_id":{$ne:userID}},
                                        {userIsActivie:0, lastUserAccess: 0,__v: 0}); //Fields that will not be returned in result
        
            if(users == []){
                // Nothing to do
                console.log("No potential match users in this language");
            }else{
                // Add possible match users to list
                usersList.push(users);
            }
            users = null;
        }

        /*
        // First possible way
        if (users.length > -1) {
            return res.status(200).json({
                //'message': 'users fetched successfully',
                'data': users
            });
        }*/

        // Second possible way
        if (usersList.length > 0) {
            return res.status(200).json({
                'message': 'users fetched successfully',
                'languages': languagesList ,
                // Create data section with language as key value of the users
                'data': {[languagesList[0]]:usersList[0],[languagesList[1]]:usersList[1],[languagesList[2]]:usersList[2]}
            });
        }

        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found in match :(. Update your settings to have more chances :)!'
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}
// TODO -> DEVELOPE THIS FUNCTIONS
const sendNewMatchRequest = async (req, res, next) => { 
    try {


        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found'
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const acceptNewMatchRequest = async (req, res, next) => { 
    try {


        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found'
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const denyNewMatchRequest = async (req, res, next) => { 
    try {


        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found'
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

// TODO -> Maybe create a folder for match -> request, valid match, list of matchs

module.exports = {
    getPossibleMatchUsers: getPossibleMatchUsers,
    sendNewMatchRequest: sendNewMatchRequest
}