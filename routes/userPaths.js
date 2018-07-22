'use strict';
const express = require('express');
const router = express.Router();

const passport = require('passport');

const UserPaths = require('../models/userPaths');
const Path = require('../models/path');
const User = require('../models/user');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;
  UserPaths.find({ userId })
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const paths = {
    displayPath: {
      index: 0,
      videos: []
    },
    savedPaths: [],
    currentPaths: [],
    completedPaths: [],
    userId
  };
  UserPaths.create(paths)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { pathId } = req.body;

  Path.findById(pathId)
    .then(path => {
      return path;
    })
    .then(path => {
      return UserPaths.findById(id, (err, paths) => {
        paths.savedPaths.push(path)
        paths.save();
      })
    })
    .then(result => res.json(result))
    .catch(err => next(err));
})

module.exports = router;