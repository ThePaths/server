'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');

// Should be protected or removed in production
// GET all users
router.get('/', (req, res, next) => {
  User.find()
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// GET user by username
router.get('/:username', (req, res, next) => {
  User.find({username: req.params.username})
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});

// GET user by MongoDB _id
router.get('/id/:id', (req, res, next) => {
  User.find({_id: req.parmas.id})
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/addpath/:id', (req, res, next) => {
  const {id} = req.params;
  // const userId = req.user.id;
  const { path } = req.body;
  User.findById(id)
    .then(user => {
      // let saved = user.savedPaths;
      console.log(user)
      user.savedPaths = [...user.savedPaths, {path}];
      return user.save()
    })
    .then(user => res.json(user))
    .catch(err => next(err))
})

module.exports = router;