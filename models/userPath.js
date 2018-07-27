'use strict';
const mongoose = require('mongoose');

const userPathSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  savedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Path' }],
  completedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Path' }],
  currentPaths: [{
    path: {type: mongoose.Schema.Types.ObjectId, ref: 'Path'}, 
    completedVideos: [Boolean], 
    lastVideoIndex: Number, 
  }],
});

userPathSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Don't return unecessary auto-generated ObjectId for each object in currentPaths
    ret.currentPaths.forEach(currPath => delete currPath._id);
  }
});

module.exports = mongoose.model('UserPath', userPathSchema);