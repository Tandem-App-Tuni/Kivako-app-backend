//import schedule from 'node-schedule'
const User = require('./models/user');
const Email = require('./email')
const fs = require('fs');
const path = require('path');


// Make a set of functions to run and export the module to the server
const runDailyFunctions = async (req, res, next) => {
    try {
        console.log("[INFO]Running daily functions!")
        oneMonthInactiveUsers();
        oneYearInactiveUsers();
        console.log("[INFO]Daily functions finished!")

    } catch (error) {
        // Nothing to do
    }
}


// Set as inactive users that don't access the system in more than one month and send an info email.
const oneMonthInactiveUsers = async (req, res, next) => {
    try {
        // Set one month as the cutoff date
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 31);

        var inactiveUsers = User.find({
            "lastUserAccess": {
                $gt: cutoff
            }
        })

        for (i = 0; i < (await inactiveUsers).length; i++) {
            let user = inactiveUsers[i];
            User.findByIdAndUpdate(user._id, {
                userIsActivie: false
            });
            Email.sendEmailInactiveAccountOneMonth(user);
        }

    } catch (error) {
        // Nothing to do
    }
}


// Delete all the data of users that don't access the system in more than one year and send an info email.
const oneYearInactiveUsers = async (req, res, next) => {
    try {
        // Set one year as the cutoff date
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 364);

        var inactiveUsers = User.find({
            "lastUserAccess": {
                $gt: cutoff
            }
        })

        for (i = 0; i < (await inactiveUsers).length; i++) 
        {
            let user = inactiveUsers[i];

            fs.unlink(path.join('./configs/uploads', user.email), (err) => 
            {
                if (err) throw err;
            });

            //Add removal of matches, chat rooms of the user...
            User.findByIdAndRemove(user._id);
            Email.sendEmailInactiveAccountOneYear(user);
        }

    } catch (error) 
    {
        console.log(error);
    }
}

module.exports = {
    runDailyFunctions: runDailyFunctions
}