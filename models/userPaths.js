'use strict';
const mongoose = require('mongoose');

const userPathsSchema = mongoose.Schema({
  savedPaths: [{path: mongoose.Schema.Types.ObjectId, title: String, hero: String},{unique: true}], // get path as _id
  currentPaths: [{path: mongoose.Schema.Types.ObjectId, currentVideoIndex: Number, totalVideos: Number, title: String, hero: String},{unique: true}],
  completedPaths: [{path: mongoose.Schema.Types.ObjectId, title: String, hero: String},{unique: true}],
  displayPath: {
    path: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    videos: [{
      videoId: String,
      replit: String
    }],
    index: {type: Number, default: 0}
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

userPathsSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('UserPaths', userPathsSchema)