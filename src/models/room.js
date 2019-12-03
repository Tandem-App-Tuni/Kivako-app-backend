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
        roomId:
        {
            type: String,
            required: true
        },
        messages:
        {
            type: [messageSchema]
        }
    });

module.exports = mongoose.model('Room', roomSchema);