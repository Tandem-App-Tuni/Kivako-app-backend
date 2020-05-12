const User = require('./models/user');
const Room = require('./models/room');
const Match = require('./models/match');
const Constants = require('./configs/constants');

/**
 * Simple maintenance checks of the database
 * carried out on a daily basis. Checking for
 * room validity (users of rooms should exist,...), match validity
 * (users inside matches should exist,...) and user validity (users with valida matches, rooms).
 */

async function databaseCheck()
{   
    try
    {
        let results = await Promise.all([checkUserValidity(), checkMatchValidity(), checkRoomValidity()]);

        results.forEach((r, index) =>
        {
            console.log(index, r);
        });
    }
    catch(error)
    {
        console.log('Error in maintenance', error);
    }
}

async function checkUserValidity()
{
    let output = '';
    
    try
    {
        const users = await User.find({}, {email:1, matches:1, rooms:1});

        for (let j = 0; j < users.length; j++)
        {
            let e = users[j];

            if (e.matches.length > Constants.maxMatchCount) output += `[MAINTENANCE] User ${e.email} exceeded match maximum count!\n`;
            
            let results = await Promise.all([Match.find({_id: {$in: e.matches}}), Room.find({_id: {$in: e.rooms}})]);
            let matches = results[0];
            let rooms = results[1];

            for (let i = 0; i < matches.length; i++)
            {
                let m = matches[i];

                if (!m) output += `[MAINTENENCE] User ${e.email} has an unexisting match ${matches[i]}!\n`;
                else
                {
                    let requesterUser = m.requesterUser;
                    let recipientUser = m.recipientUser;

                    if (requesterUser !== e._id && recipientUser !== e._id) output += `[MAINTENENCE] User ${e.email} is a member of an invalid match ${m._id}!\n`;
                }
            }

            for (let i = 0; i < rooms.length; i++)
            {
                let r = rooms[i];

                if (!r) output += `[MAINTENENCE] User ${e.email} has an unexisting room ${rooms[i]}!\n`;
                else if (r.user0 !== e.email && r.user1 !== e.email) output += `[MAINTENENCE] User ${e.email} is a member of an invalid room ${r._id}!\n`;
            }
        }

        return output;
    }
    catch (error)
    {
        output += '[MAINTENANCE] Error in checkUserValidity.';
        return output;
    }
}

async function checkRoomValidity()
{
    let output = '';

    try
    {
        const rooms = await Room.find({}, {user0:1, user1:1});

        for (let i = 0; i < rooms.length; i++)
        {
            let r = rooms[i];

            let results = await Promise.all([User.findOne({email: r.user0}, {email:1}), User.findOne({email: r.user1}, {email:1})]);
            let user0 = results[0];
            let user1 = results[1];

            if (!user0 || !user1) output += `[MAINTENANCE] Room with users ${user0} ${user1} is invalid. One or both of the users are null.\n`;
        }

        return output;
    }
    catch(error)
    {
        output += '[MAINTENANCE] Error in checkRoomValidity';
        return output;
    }
}

async function checkMatchValidity()
{
    let output = '';

    try
    {
        const matches = await Match.find({}, {recipientUser: 1, requesterUser: 1});

        for (let i = 0; i < matches.length; i++)
        {
            let m = matches[i];

            let results = await Promise.all([User.findById(m.recipientUser, {email:1}), User.findById(m.requesterUser, {email:1})]);
            let recipientUser = results[0];
            let requesterUser = results[1];

            if (!recipientUser || !requesterUser) output += `[MAINTENANCE] Room match users ${user0} ${user1} is invalid. One or both of the users are null.\n`;            
        }

        return output;
    }
    catch(error)
    {
        output += '[MAINTENANCE] Error in checkMatchValidity ' + error;
        return output;
    }
}

module.exports = {
    databaseCheck: databaseCheck
}