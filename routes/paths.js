'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;

const Path = require('../models/path');
const User = require('../models/user');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.get('/', (req, res, next) => {
  Path.find()
    .sort('title')
    .then(paths => {
      res.json(paths);
    })
    .catch(err => next(err));
});

// UNTESTED
// POST a new saved path to a currently logged in user
// req.body must contain key "pathId" with MongoDB ObjectId as it's value
router.post('/save', jwtAuth, (req, res, next) => {
  const { id, username } = req.user;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status(400);
    return next(err);
  }
  console.log(username);
  Path.findById(pathId)
    .then(path => {
      if(!path){
        Promise.reject({
          code: 400,
          reason: 'Bad Request',
          message: `Could not find path with id ${pathId}`,
        });
      }
      return path;
    })
    .then((path) => {
      let newSavedPath = {path: pathId, hero: path.hero, title: path.title};
      User.findByIdAndUpdate(id, {$push: {savedPaths: newSavedPath}}, {new: true}, (err, doc) => {
        if(err){
          Promise.reject({
            code: 500,
            reason: 'Internal Server Error',
            message: 'Failed to updated user with new saved path',
          });
        } else {
          res.json(doc);
        }
      });
    })
    .catch((err)=>{
      next(err);
    });
});

// UNTESTED
// POST a new path to set as in progress to logged in user
// req.body must contain key "pathId" with MongoDB ObjectId as it's value
// Checks if recieved pathId is a saved path and removes it if so
router.post('/start', jwtAuth, (req, res, next) => {
  const { id, username } = req.user;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status(400);
    return next(err);
  }
  console.log(username);
  Path.findById(pathId)
    .then(path => {
      if(!path){
        Promise.reject({
          code: 400,
          reason: 'Bad Request',
          message: `Could not find path with id ${pathId}`,
        });
      }
      return path;
    })
    .then((path) => {
      let newCurrentPath = {path: pathId, hero: path.hero, title: path.title};
      User.findByIdAndUpdate(id, {$push: {currentPaths: {$each: [newCurrentPath], $position: 0}}}, {new: true}, (err, doc) => {
        if(err){
          Promise.reject({
            code: 500,
            reason: 'Internal Server Error',
            message: 'Failed to updated user with new saved path',
          });
        } else {
          res.json(doc.currentPaths);
        }
      });
    })
    .catch((err)=>{
      next(err);
    });
});

router.post('/display', jwtAuth, (req, res, next) => {
  const { id, username } = req.user;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status(400);
    return next(err);
  }
  console.log(username);
  Path.findById(pathId)
    .then(path => {
      if(!path){
        Promise.reject({
          code: 400,
          reason: 'Bad Request',
          message: `Could not find path with id ${pathId}`,
        });
      }
      return path;
    })
    .then((path) => {
      let newDisplay = {path: pathId, title: path.title, description: path.description, videos: path.videos};
      User.findByIdAndUpdate(id, {$set: {displayPath: newDisplay}}, {new: true})
        .then(user => res.json(user))
        .catch(err => console.log(err));
        // if(err){
        //   Promise.reject({
        //     code: 500,
        //     reason: 'Internal Server Error',
        //     message: 'Failed to updated user with new saved path',
        //   });
        // } else {
        //   res.json(doc);
        // }
    })
    .catch((err)=>{
      next(err);
    });
})

module.exports = router;