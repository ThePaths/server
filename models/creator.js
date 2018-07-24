'use strict';
const mongoose = require('mongoose');

const creatorSchema = mongoose.Schema({
  name: {type: String, required: true},
  paths: [{type:mongoose.Schema.Types.ObjectId, ref: 'Path'}],
  videos: [{type:mongoose.Schema.Types.ObjectId, ref: 'Video'}],
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  youtube: {type: String, default:''},
  pateron: {type: String, default:''},
  twitter: {type: String, default:''},
  website: {type: String, default:''},
});

creatorSchema.set('toObject', {
  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Creator', creatorSchema);