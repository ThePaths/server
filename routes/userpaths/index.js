'use strict';
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
// Models & Schemas
const UserPaths = require('../../models/userPath');
// Middleware
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));
// Child routers
router.use('/', require('./save'));
router.use('/', require('./current'));
router.use('/', require('./complete'));

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  UserPaths.find({ userId })
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});

router.get('/status/:pathId', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.params;
  UserPaths.findOne({ userId })
    .then((userpath) => {
      if (userpath.savedPaths.indexOf(pathId) > -1) {
        return res.status(200).json('saved');
      } else if (userpath.completedPaths.indexOf(pathId) > -1) {
        return res.status(200).json('completed');
      } else if (userpath.currentPaths.findIndex(currentPath => currentPath.path.toString() === pathId) > -1) {
        return res.status(200).json('current');
      } else {
        return res.status(200).json('none');
      }
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
