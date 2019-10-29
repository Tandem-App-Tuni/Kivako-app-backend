const mongoose = require('mongoose');

var languageSchema = new mongoose.Schema({ language: String, level: String }, { noId: true });

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



