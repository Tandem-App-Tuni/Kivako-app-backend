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
  cityOne: {
      type: String,
      required: true
  },
  cityTwo: {
      type: String
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
      type: Boolean
  },
  lastUserAccess:{ 
      type: Date, 
      default: Date.now 
  }

});

const User = mongoose.model('User', userSchema2);

module.exports = User;



