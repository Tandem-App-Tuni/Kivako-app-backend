//import schedule from 'node-schedule'
const User = require('./models/user');
const ResetPassword = require('./models/resetPassword');
const Email = require('./emailServer')
const UserService = require('./services/user');

/**
 * Daily function checking and removing inactive users.
 * Always make sure to first check for one year inactive users and then
 * one month inactive users.
 * The function parameters are unecessary and should be removed in the future.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const runDailyFunctions = async (req, res, next) => 
{
    try {
        console.log("[DAILY] Running daily functions!")
        oneYearInactiveUsers();
        oneMonthInactiveUsers();
        removeOldResetPasswordForms();
        console.log("[DAILY] Daily functions finished!")

    } 
    catch (error) 
    {
        console.log('[DAILY] Error in runDailyFunctions', error);
    }
}


const removeOldResetPasswordForms = async (req, res, next) =>
{
    try
    {
        let cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 1/24);

        ResetPassword.deleteMany({timestamp: {$lt: cutoff}});
    }
    catch (error)
    {
        console.log('[DAILY] Error in removeOldResetPasswordForms', error);
    }
}

// Set as inactive users that don't access the system in more than one month and send an info email.
const oneMonthInactiveUsers = async (req, res, next) => 
{
    try
    {
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 31);

        var inactiveUsers = await User.find({"lastUserAccess": {$lt: cutoff}, isActive: true});

        for (i = 0; i < inactiveUsers.length; i++) 
        {
            let user = inactiveUsers[i];

            await User.findByIdAndUpdate(user._id, {isActive: false});
            Email.monthNotification(user);
        }

    } catch (error) 
    {
        console.log('[DAILY] Error in oneMonthInactiveUsers', error);
    }
}


// Delete all the data of users that don't access the system in more than one year and send an info email.
const oneYearInactiveUsers = async (req, res, next) => 
{
    try 
    {
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 364);

        var inactiveUsers = await User.find({"lastUserAccess": {$lt: cutoff}, isActive: false});

        for (i = 0; i < inactiveUsers.length; i++) 
        {
            let user = inactiveUsers[i];

            UserService.helperDeleteUser(user.email);
            Email.yearNotification(user);
        }

    } 
    catch (error) 
    {
        console.log('[DAILY] Error in oneYearInactiveUsers', error);
    }
}

module.exports = {
    runDailyFunctions: runDailyFunctions
}