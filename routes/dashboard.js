'use strict';
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
// Models & Schemas
const UserPath = require('../models/userPath');
// Middleware
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.get('/keeplearning', jwtAuth, (req, res, next) => {
  UserPath.findOne({userId: req.user.id})
    .populate({
      path: 'currentPaths.path'
    })
    .then(userpath => {
      res.json(userpath.currentPaths);
    })
    .catch(err => {
      next(err);
    });
});

router.get('/savedPaths', jwtAuth, (req, res, next) => {
  UserPath.findOne({userId: req.user.id})
    .populate({path: 'savedPaths'})
    .then(userpath => {
      res.json(userpath.savedPaths);
    })
    .catch(err => {
      next(err);
    });
});

router.get('/completedPaths', jwtAuth, (req, res, next) => {
  UserPath.findOne({userId: req.user.id})
    .populate({path: 'completedPaths'})
    .then(userpath => {
      res.json(userpath.compltedPaths);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
