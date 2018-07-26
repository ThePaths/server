'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;

const Path = require('../models/path');
const User = require('../models/user');
const UserPath = require('../models/userPath');
const Creator = require('../models/creator');
const Video = require('../models/video'); // Used by populate

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

// GET all paths w/o populated video data
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
    .limit(2) // Updated to 3 when more paths are added
    .populate('videos')
    .then(paths => {
      paths[0].videos = [paths[0].videos[0]]; 
      paths[1].videos = [paths[1].videos[0]]; 
      //paths[2].videos = [paths[2].videos[0]]; 
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
    .then(path => {
      if(path){
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

router.post('/nextVideo', jwtAuth, (req, res, next) => {
  const { id } = req.user;
  const { pathId } = req.body;
  User.findById(id, (err, user) => {
    if(err){
      next(err);
    }
    for(let i = 0; i < user.currentPaths.length; i++){
      if(user.currentPaths[i].path.toString() === pathId){
        user.currentPaths[i].currentVideoIndex = user.currentPaths[i].currentVideoIndex + 1; 
        return user.save(() => {
          res.status(201).json({message: 'Incremented index'});
        });
      }
    }
    return res.status(200).json({message: 'Recieved path is not a current path of user'});
  });
});


module.exports = router;