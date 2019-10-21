const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
}, {
  timestamps: true,
});

var userSchema2 = new mongoose.Schema({
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
      type: [String],
      required: true
  },
  languagesToLearn: {
      type: [String],
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

const User = mongoose.model('User', userSchema2);

module.exports = User;



