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
      Path.findById(pathId, (err, path) => {

        // Add err and empty return handling

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

        // Add validation path is not current or completed

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

router.put('/display', (req, res, next) => {
  const userId = req.user.id;
  const {pathId} = req.body;

  UserPaths.find({userId})
    .then(user => {
      Path.findById(pathId, (err, newPath) => {
        console.log(newPath);
        const display = {index: 0, title: newPath.title, description: newPath.description, videos: newPath.videos};
        user[0].displayPath = display;
        user[0].save();
      });
      return user[0];
    })
    .then(result => {
      console.log('new: ',result);
      res.json(result);
    })
    .catch(err => next(err));
});



module.exports = router;