'use strict';
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
// Models & Schemas
const UserPaths = require('../../models/userPath');
const Path = require('../../models/path');
// Middleware
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.put('/start', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;
  if (!ObjectId.isValid(pathId) || !ObjectId.isValid(userId)) {
    const err = new Error('Provided path Id or user Id is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  UserPaths.findOne({ userId })
    .then(userpath => {
      // This findById is to verify the path exists
      Path.findById(pathId, (err, path) => {

        // Add error and empty return handling

        let duplicate = false;
        for (let i = 0; i < userpath.currentPaths.length; i++) {
          if (userpath.currentPaths[i].path.toString() === pathId) {
            duplicate = true;
            break;
          }
        }
        if (!duplicate) {
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
      res.status(200).json('current');
    })
    .catch(err => {
      next(err);
    });
});

router.put('/unstart', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;
  if (!ObjectId.isValid(pathId) || !ObjectId.isValid(userId)) {
    const err = new Error('Provided path Id or user Id is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  UserPaths.findOne({ userId })
    .then(userpath => {
      // Add error and empty return handling

      let indexOfPath = userpath.currentPaths.findIndex(currentPath => currentPath.path.toString() === pathId);
      if (indexOfPath > -1) {
        userpath.currentPaths.splice(indexOfPath, 1);
        userpath.markModified('currentPaths');
        return userpath.save();
      } else {
        return userpath.save();
      }
    })
    .then((userpath) => {
      res.status(200).json(userpath);
    })
    .catch(err => {
      next(err);
    });
});

router.put('/setVideoIndex', (req, res, next) => {
  const userId = req.user.id;
  const { pathId, videoIndex } = req.body;
  if (!ObjectId.isValid(pathId) || !ObjectId.isValid(userId) || typeof videoIndex !== 'number') {
    const err = new Error('Provided `pathId`, `userId`, or `videoIndex` is not valid');
    err.status = 400;
    return next(err);
  }
  return UserPaths.findOne({ userId }, (err, userpath) => {
    if(err){
      return next(err);
    }
    let indexOfPath = userpath.currentPaths.findIndex(currentPath => {
      return currentPath.path.toString() === pathId;
    });
    if(indexOfPath > -1){
      if(userpath.currentPaths[indexOfPath].completedVideos.length-1 < videoIndex){
        userpath.currentPaths[indexOfPath].lastVideoIndex = userpath.currentPaths[indexOfPath].completedVideos.length-1;
        userpath.markModified(`currentPaths[${indexOfPath}]`);
        userpath.save((err) => {
          if(err){
            next(err);
          } else {
            return res.status(204).json(/*'Provided `videoIndex` was outside of range. Set to max index.'*/);
          }
        });
      } else {
        userpath.currentPaths[indexOfPath].lastVideoIndex = videoIndex;
        userpath.markModified(`currentPaths[${indexOfPath}]`);
        userpath.save((err) => {
          if(err){
            next(err);
          } else {
            return res.status(204).json();
          }
        });
      }
    } else {
      const err = new Error('Provided pathId was not found in user`s current paths');
      err.status = 404;
      return next(err);
    }
  });
});

router.put('/completeVideo', (req, res, next) => {
  const userId = req.user.id;
  let { pathId, videoIndex } = req.body;
  videoIndex = parseInt(videoIndex);
  UserPaths.findOne({ userId })
    .then((userpath) => {
      let pathIndex = userpath.currentPaths.findIndex((currentPath) => {
        return currentPath.path.toString() === pathId;
      });
      if (pathIndex > -1) {
        userpath.currentPaths[pathIndex].completedVideos[videoIndex] = true;
        userpath.markModified('currentPaths');
        userpath.save();
      }
      return;
    })
    .then(() => {
      UserPaths.findOne({ userId })
        .then((userpath) => {
          let pathIndex = userpath.currentPaths.findIndex((currentPath) => {
            return currentPath.path.toString() === pathId;
          });
          return userpath.currentPaths[pathIndex].completedVideos;
        } )
        .then((response) => res.json(response));      
    })
    .catch((err) => next(err));
});

router.put('/reset', (req, res, next) => {
  // reset progress of a current path or move it back to current from completed
});

module.exports = router;
