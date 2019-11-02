const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var matchSchema = new mongoose.Schema({
    requesterUser: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientUser: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { 
        type: Number,
        default: 1
        // Status 1-> Pending, 2-> Accept and active, 3-> Not accepted ,4-> Match finished, 5-> Match finished and user blocked
    },
    requestDate: {
        type: Date,
        default: Date.now 
    },
    matchStartDate: {
        type: Date,
        default: null
    },
    matchEndDate: {
        type: Date,
        default: null 
    },
    matchChatChanell:{
        type: String,
        default: null
    }
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;