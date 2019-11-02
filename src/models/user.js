const mongoose = require('mongoose');

var languageSchema = new mongoose.Schema({ language: String, level: String, credits: Number }, { noId: true });

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
      type: [languageSchema], // Format: {"language":"PT", "level": "B2", "credits": 3}
      required: true
  },
  languagesToLearn: {
      type: [languageSchema], // Format: {"language":"PT", "level": "B2", "credits": 3}
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



