'use strict';
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
// Models & Schemas
const UserPaths = require('../../models/userPath');
// Middleware
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.put('/save', (req, res, next) => {
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
      let duplicate = false;
      for (let i = 0; i < userpath.savedPaths.length; i++) {
        if (userpath.savedPaths[i]._id.toString() === pathId) {
          duplicate = true;
          break;
        }
      }
      if (!duplicate) {
        userpath.savedPaths.push(pathId);
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

router.put('/unsave', (req, res, next) => {
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

      let indexOfPath = userpath.savedPaths.indexOf(pathId);
      if (indexOfPath > -1) {
        userpath.savedPaths.splice(indexOfPath, 1);
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

module.exports = router;
