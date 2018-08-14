'use strict';
// Dependencies
const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
// Models & Schemas
const Path = require('../models/path');
require('../models/creator'); // Is actully used by .populate('creator', 'name');
require('../models/video');

// GET all paths without populated video data
// Used for explore page
router.get('/', (req, res, next) => {
  Path.find()
    .sort('title')
    .populate('creator', 'name')
    .then(paths => {
      res.json(paths);
    })
    .catch(err => next(err));
});
 
router.get('/guest', (req, res, next) => {
  Path.find()
    .limit(3)
    .populate('creator', 'name')
    .then(paths => {
      paths[0].videos = [paths[0].videos[0]]; 
      paths[1].videos = [paths[1].videos[0]]; 
      paths[2].videos = [paths[2].videos[0]];
      res.set('Cache-control', 'public, max-age=86400, s-maxage=86400'); 
      res.json(paths);
    })
    .catch(err => next(err));
});

// GET one path by Id
router.get('/:pathId', (req, res, next) => {
  const {pathId} = req.params;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  Path.findById(pathId)
    .populate('videos')
    .populate('creator', 'name')
    .populate({
      path: 'videos',
      populate: {path: 'creator', select: 'name youtube'}
    })
    .then(path => {
      if(path){
        res.set('Cache-control', 'public, max-age=3600, s-maxage=3600'); 
        res.json(path);
      } else {
        Promise.reject({
          code: 400,
          reason: 'Bad Request',
          message: `Could not find path with id ${pathId}`,
        });
      }
    })
    .catch(err => next(err));
});

module.exports = router;
