const mongoose = require('mongoose');

var newsSchema = new mongoose.Schema({
  title: 
  {
    type: String,
    required: true
  },
  content: 
  {
    type: String,
    required: true
  },
  author: 
  {
    type: String,
    required: true
  },
  createdAt:
  {
    type: Date,
  },
  updatedAt: 
  {
    type: Date,
  },
});

newsSchema.pre('save', function (next) {
  if(this.isNew) {
    this.createdAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});


const News = mongoose.model('News', newsSchema);
module.exports = News;