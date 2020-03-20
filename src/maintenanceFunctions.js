const User = require('./models/user');
const Room = require('./models/room');
const Match = require('./models/match');
const ResetPassword = require('./models/resetPassword');
const Constants = require('./configs/constants');

async function databaseCheck()
{   
    let results = await Promise.all([checkUserValidity(), checkMatchValidity(), checkRoomValidity(), checkResetPasswordValidity()]);
}

async function checkUserValidity()
{
    try
    {
        let output = '';
        let flag = true;

        const users = await User.find({}, {email:1, matches:1, rooms:1});

        users.forEach(e => 
        {
            if (e.matches.length > Constants.maxMatchCount)
            {
                flag = false;
                output += `[MAINTENANCE] User ${e.email} exceeded match maximum count!\n`;
            }

            let results = await Promise.all([Match.find({_id: {$in: e.matches}}), Room.find({_id: {$in: e.rooms}})]);
            let matches = results[0];
            let rooms = results[1];

            matches.forEach(m,index => 
            {
                if (!m)
                {
                    flag = false;
                    output += `[MAINTENENCE] User ${e.email} has an unexisting match ${matches[index]}!\n`;
                }
                else
                {
                    let requesterUser = m.requesterUser;
                    let recipientUser = m.recipientUser;

                    if (requesterUser !== e._id && recipientUser !== e._id)
                    {
                        flag = false;
                        output += `[MAINTENENCE] User ${e.email} is a member of an invalid match ${m._id}!\n`;
                    }
                }
            });

            rooms.forEach(r,index =>
            {
                if (!r)
                {
                    flag = false;
                    output += `[MAINTENENCE] User ${e.email} has an unexisting room ${rooms[index]}!\n`;
                }
                else
                {
                    if (r.user0 !== e.email && r.user1 !== e.email)
                    {
                        flag = false;
                        output += `[MAINTENENCE] User ${e.email} is a member of an invalid room ${r._id}!\n`;
                    }
                }
            });
        });

        return {flag:flag, output: output};
    }
    catch (error)
    {
        return {flag:false, output:'[MAINTENANCE] Error in checkUserValidity.'};
    }
}

async function checkRoomValidity()
{
    try
    {
        let output = '';
        let flag = true;
    }
    catch(error)
    {
        return {flag: false, output: '[MAINTENANCE] Error in checkRoomValidity'};
    }
}

async function checkMatchValidity()
{
    try
    {
        let output = '';
        let flag = true;
    }
    catch(error)
    {
        return {flag: false, output: '[MAINTENANCE] Error in checkMatchValidity'};
    }
}

async function checkResetPasswordValidity()
{
    try
    {
        let output = '';
        let flag = true;
    }
    catch(error)
    {
        return {flag: false, output: '[MAINTENANCE] Error in checkResetPasswordValidity'};
    }
}