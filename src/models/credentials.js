const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var credentialsSchema = new Schema(
    {
        email:
        {
            type: String,
            required: true
        },
        password:
        {
            type: String,
            required: true
        }
    });

module.exports = mongoose.model('Credentials', credentialsSchema);