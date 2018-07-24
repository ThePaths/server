'use strict';
const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
  title: {type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref:'Creator', default: null},
  description: {type: String, default:''},
  videoId: {type: String, required:true},
  replit: {type: String, default:''},
});

videoSchema.set('toObject', {
  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Video', videoSchema);