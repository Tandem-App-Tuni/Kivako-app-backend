const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  password:
  {
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
      required: true,
      default:true
  },
  lastUserAccess:{ 
      type: Date, 
      default: Date.now 
  },
  profileImg:{ 
      type:String
  },
  rooms:
  {
    type:[String]
  },
  matches:[{type: Schema.Types.ObjectId, ref: 'Match'}], // List of the matches that user has, counting current and historic ones.
  isAdmin:{
      type: Boolean,
      required:true,
      default:false
  },
  university:{
      type:String
  }
});


const User = mongoose.model('User', userSchema);
module.exports = User;



