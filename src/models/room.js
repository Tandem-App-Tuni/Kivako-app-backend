const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var messageSchema = new Schema(
    {
        id:
        {
            type: String,
            required: true
        },
        timestamp:
        {
            type: Date,
            default: Date.now,
        },
        text:
        {
            type: String,
            default: ''
        }
    });

var roomSchema = new Schema(
    {
        messages:
        {
            type: [messageSchema]
        },
        user0:
        {
            type: String,
            required: true
        },
        user1:
        {
            type: String,
            required: true
        },
        
    });

module.exports = mongoose.model('Room', roomSchema);