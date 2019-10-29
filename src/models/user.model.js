const mongoose = require('mongoose');

var languageSchema = new mongoose.Schema({ language: String, level: String, credits: Number }, { noId: true });

var matchSchema = new mongoose.Schema({
    requester: {
        type: Number,
        required: true
    },
    recipient: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    requestDate: {
        type: Date
    },
    matchBeginningDate:{
        type: Date
    },
    matchEndDate:{
        type: Date
    }
});
// Status : 1-> Pendente, 2-> Ativo, 3-> Encerrado, 4 -> Encerrado/Bloqueado


var userSchema = new mongoose.Schema({
  firstName: {
      type: String,
      required: true
  },
  lastName: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true
  },
  cities: {
      type: [String]
  },
  descriptionText: {
      type: String,
      required: true
  },
  languagesToTeach: {
      type: [languageSchema], // Format: {"language":"PT", "level": "B2"}
      required: true
  },
  languagesToLearn: {
      type: [languageSchema],
      required: true
  },
  userIsActivie:{
      type: Boolean,
      required: true
  },
  lastUserAccess:{ 
      type: Date, 
      default: Date.now 
  },
  profileImg:{ 
      type:String
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;



