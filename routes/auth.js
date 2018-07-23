'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const passport = require('passport');

const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const User = require('../models/user');
const UserPaths = require('../models/userPaths');

const options = { session: false, failWithError: true };

const localAuth = passport.authenticate('local', options);
const jwtAuth = passport.authenticate('jwt', {session: false});

function createAuthToken (user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

router.post('/register', (req, res) => {
  let {email, username, password } = req.body;

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }

      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        email,
        username,
        password: hash
      });
    })
    // .then(user => {
    //   return res.status(201).json(user);
    // })
    .then(user => {
      console.log(user)
      const paths = {
        displayPath: {
          index: 0,
          videos: []
        },
        savedPaths: [],
        currentPaths: [],
        completedPaths: [],
        userId: user.id
      };
      UserPaths.create(paths);
      return res.status(201).json(user)
    })
    // .then(result => {
    //   res.location(`${req.originalUrl}/${result.id}`)
    //     .status(201)
    //     .json(result);
    // })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = router;
