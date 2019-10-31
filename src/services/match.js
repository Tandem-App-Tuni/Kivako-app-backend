/********
* match.js file (services/matchs)
********/
const express = require('express');
const User = require('../models/user');


const getPossibleMatchUsers = async (req, res, next) => { // TODO, APPLY SELECT FILTER TO JUST RETURN SOME INFO
    try {
        let languages = [
            {
              "language": "PT",
              "level": "B2",
              "credits": 3
            },
            {
              "language": "EN",
              "level": "B1",
              "credits": 2
            }
          ];
        
        
        let users = [];
        let languagesList = []
        console.log(languages.length);
        for (i = 0; i < languages.length; i++) {
            //console.log(languages[i].language);
            languagesList.push(languages[i].language);
            let users2 = await User.find({"languagesToTeach.language":languages[i].language},
                                        {userIsActivie:0, lastUserAccess: 0}); //fields not select
            //console.log(users2);
            if(users2 == []){
                console.log("oi");
            }else{
                users.push(users2);
            }
            users2 = null;
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
        if (users.length > -1) {
            return res.status(200).json({
                'message': 'users fetched successfully',
                'languages': languagesList ,
                'data': {[languagesList[0]]:users[0],[languagesList[1]]:users[1],[languagesList[2]]:users[2]}
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

module.exports = {
    getPossibleMatchUsers: getPossibleMatchUsers
}