const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var resetPassword = new Schema(
    {
        id:
        {
            type: String,
            required: true
        },
        token:
        {
            type: String,
            required: true
        },
        timestamp:
        {
            type: Date,
            default: Date.now,
        }
    });



module.exports = mongoose.model('ResetPassword', resetPassword);