'use strict';
const express = require('express');
const router = express.Router();

const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;

const UserPaths = require('../models/userPath');
const Path = require('../models/path');
const User = require('../models/user');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  UserPaths.find({ userId })
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});

router.put('/save', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;

  if(!ObjectId.isValid(pathId) || !ObjectId.isValid(userId)){
    const err = new Error('Provided path Id or user Id is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }

  UserPaths.findOne({userId})
    .then(userpath => {
      // This findById is to verify the path exists
      Path.findById(pathId, (err, path) => {

        // Add error and empty return handling

        let duplicate = false;
        for(let i = 0; i < userpath.savedPaths.length; i++){
          if(userpath.savedPaths[i]._id.toString() === pathId){
            duplicate = true;
            break;
          }
        }
        if(!duplicate){
          userpath.savedPaths.push(pathId);
          userpath.save();
        }
      });
      return;
    })
    .then(() => {
      res.status(200).json('saved');
    })
    .catch(err => {
      next(err);
    });
});

router.put('/unsave', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId) || !ObjectId.isValid(userId)){
    const err = new Error('Provided path Id or user Id is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  UserPaths.findOne({userId})
    .then(userpath => {

      // Add error and empty return handling

      let indexOfPath = userpath.savedPaths.indexOf(pathId);
      if(indexOfPath > -1){
        userpath.savedPaths.splice(indexOfPath, 1);
        userpath.save();
      }
      return;
    })
    .then(() => {
      res.status(200).json('none');
    })
    .catch(err => {
      next(err);
    });
});

router.put('/start', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId) || !ObjectId.isValid(userId)){
    const err = new Error('Provided path Id or user Id is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  UserPaths.findOne({userId})
    .then(userpath => {
      // This findById is to verify the path exists
      Path.findById(pathId, (err, path) => {

        // Add error and empty return handling

        let duplicate = false;
        for(let i = 0; i < userpath.currentPaths.length; i++){
          if(userpath.currentPaths[i].path.toString() === pathId){
            duplicate = true;
            break;
          }
        }
        if(!duplicate){
          userpath.currentPaths.push({
            path: pathId,
            completedVideos: Array(path.videos.length).fill(false),
            lastVideoIndex: 0
          });
          userpath.save();
        }
      });
      return;
    })
    .then(() => {
      res.status(202).send('current');
    })
    .catch(err => {
      next(err);
    });
});

router.put('/complete', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId) || !ObjectId.isValid(userId)){
    const err = new Error('Provided path Id or user Id is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  UserPaths.findOne({userId})
    .then(userpath => {
      // This findById is to verify the path exists
      Path.findById(pathId, (err, path) => {

        // Add error and empty return handling

        let duplicate = false;
        for(let i = 0; i < userpath.completedPaths.length; i++){
          if(userpath.completedPaths[i]._id.toString() === pathId){
            duplicate = true;
            break;
          }
        }
        if(!duplicate){
          userpath.completedPaths.push(pathId);
          userpath.save();
        }
      });
      return;
    })
    .then(() => {
      res.status(202).send();
    })
    .catch(err => {
      next(err);
    });
});



module.exports = router;
