'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport')

const User = require('../models/user')

router.get('/', (req, res, next) => {
  User.find()
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

module.exports = router;