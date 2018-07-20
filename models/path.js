'use strict';

const mongoose = require('mongoose');

const pathSchema = mongoose.Schema({
  title: {type: String, required: true, unique: true},
  hero: {type: String, required: true},
  heroSize: {type: [Number]},
  pathCreator: {type: String, required: true},
  length: {type: Number, required: true},
  description: {type: String, required: true}, 
  videos: [{
    videoId: String,
    length: Number,
    replit: String,
    creator: String,
    channelId: String,
  }]
});

pathSchema.set('toObject', {
  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

module.exports = mongoose.model('Path', pathSchema);