var matchSchema = new mongoose.Schema({
    requesterUserID: {
        type: Number,
        required: true
    },
    recipientUserID: {
        type: Number,
        required: true
    },
    status: { 
        type: Number,
        required: true
        // Status 1-> Pending, 2-> Accept and Active, 3-> Deny ,4-> Match Ended, 5-> Match Ended and user bloqued
    },
    requestDate: {
        type: Date,
        default: Date.now 
    },
    matchBeginningDate:{
        type: Date
    },
    matchEndDate:{
        type: Date
    },
    messageChanell:{
        type: String
    }
});
// Status : 1-> Pendente, 2-> Ativo, 3-> Encerrado, 4 -> Encerrado/Bloqueado

const Match = mongoose.model('Match', matchSchema);

module.exports = User;