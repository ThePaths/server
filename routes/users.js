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

module.exports = router;