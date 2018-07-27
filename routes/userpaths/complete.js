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

router.put('/complete', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;
  if (!ObjectId.isValid(pathId) || !ObjectId.isValid(userId)) {
    const err = new Error('Provided path Id or user Id is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  UserPaths.findOne({ userId })
    .then(userpath => {
      // This findById is to verify the path exists, err and path aren't intended to be used.
      Path.findById(pathId, (err, path) => {

        // Add error and empty return handling

        let duplicate = false;
        for (let i = 0; i < userpath.completedPaths.length; i++) {
          if (userpath.completedPaths[i]._id.toString() === pathId) {
            duplicate = true;
            break;
          }
        }
        if (!duplicate) {
          userpath.completedPaths.push(pathId);
          userpath.save();
        }
      });
      return userpath;
    })
    .then((userpath) => {
      res.status(200).json(userpath);
    })
    .catch(err => {
      next(err);
    });
});

router.delete('/uncomplete', (req, res, next) => {
  // remove path from completed
});

module.exports = router;
