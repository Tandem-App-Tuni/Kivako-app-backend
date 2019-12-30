import schedule from 'node-schedule'
const User = require('./models/user');



var dailyFunctions = schedule.scheduleJob('0 0 * * *', function(){
    console.log("[INFO] Running daily schedule functions");
    oneMonthInactiveUsers();
    
  });


// Set as inactive users that don't access the system in more than one month and send an info email.
const oneMonthInactiveUsers = async (req, res, next) => {
    try {
        // Set one month as the cutoff date
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate()-31);

        // Update users where the date is greater than the defined cutoff
        User.updateMany( { "lastUserAccess": {$gt: cutoff}}, { $set: { userIsActivie: false } } )
    } catch (error) {
        // Nothing to do
    }
}


// Delete all the data of users that don't access the system in more than one year and send an info email.
const oneYearInactiveUsers = async (req, res, next) => {
    try {


    } catch (error) {
        // Nothing to do
    }
}

module.exports = {
    dailyFunctions: dailyFunctions
}