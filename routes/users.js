'use strict';
// Dependencies
const router = require('express').Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
// Schemas & Models
const User = require('../models/user');
// Middleware
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

// GET all users
// Should probably be more protected
router.get('/all', jwtAuth, (req, res, next) => {
  User.find()
    .sort('name')
    .then(results => {
      res.set('Cache-control', 'public, max-age=1800, s-maxage=1800'); 
      res.json(results);
    })
    .catch(err => next(err));
});

// Should make it not return email unless a user is requesting their own information
router.get('/', jwtAuth, (req, res, next) => {
  const { id, username } = req.query;
  if(id){
    if (!ObjectId.isValid(id)) {
      const err = new Error('Provided `id` is not a valid ObjectId');
      err.status = 400;
      return next(err);
    }
    User.findById(id)
      .then(user => {
        if(user){
          delete user.email;
          res.status(200).json(user);
        } else {
          Promise.reject({
            code: 404,
            reason: 'Not Found',
            message: `Could not find user with id: ${id}`,
          });
        }
      })
      .catch(err => {
        next(err);
      });
  } else if(username){
    User.findOne({username: username})
      .then(user => {
        if(user){
          return res.status(200).json(user);
        } else {
          Promise.reject({
            code: 404,
            reason: 'Not Found',
            message: `Could not find user with username: ${username}`,
          });
        }
      })
      .catch(err => {
        next(err);
      });
  } else {
    const err = new Error('Must provide either query `id` or `username`');
    err.status = 400;
    return next(err);
  }
});

module.exports = router;
