'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  email: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  savedPaths: [{path: mongoose.Schema.Types.ObjectId, title: String, hero: String}],
  currentPaths: [{path: mongoose.Schema.Types.ObjectId, index: Number, totalVideos: Number, title: String, hero: String}],
  completedPaths: [{path: mongoose.Schema.Types.ObjectId, title: String, hero: String}],
  displayPath: {
    path: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    videos: [{
      videoId: String,
    }]
  }
});

userSchema.set('toObject', {
  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);