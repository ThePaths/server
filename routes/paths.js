'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;

const Path = require('../models/path');
const User = require('../models/user');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

// GET all paths
router.get('/', (req, res, next) => {
  Path.find()
    .sort('title')
    .then(paths => {
      res.json(paths);
    })
    .catch(err => next(err));
});

// GET one path by Id
router.get('/:pathId', (req, res, next) => {
  const {pathId} = req.params;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  Path.findById(pathId)
    .then(path => {
      if(path){
        res.json(path);
      } else {
        Promise.reject({
          code: 400,
          reason: 'Bad Request',
          message: `Could not find path with id ${pathId}`,
        });
      }
    })
    .catch(err => next(err));
});

// POST a new saved path to a currently logged in user
// req.body must contain key "pathId" with MongoDB ObjectId as it's value
router.post('/save', jwtAuth, (req, res, next) => {
  const { id } = req.user;
  const { pathId } = req.body;
  let alreadySaved = false;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
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
    .then(path => {
      User.findById(id, (err, user) => {
        if(err){
          Promise.reject({
            code: 400,
            reason: 'Bad Request',
            message: `Failed to find user with id ${id}`
          });
        }
        // Check path isn't alredy in completed
        for(let i = 0; i < user.completedPaths.length; i++){
          if(user.completedPaths[i].path.toString() === pathId){
            alreadySaved = true;
            return res.status(200).json({message : 'Path already completed'});
          }
        }
        // Check path isn't already in current
        for(let i = 0; i < user.currentPaths.length; i++){
          if(user.currentPaths[i].path.toString() === pathId){
            alreadySaved = true;
            return res.status(200).json({message : 'Path already in progress'});
          }
        }
        // Check that path isn't already saved
        for(let i = 0; i < user.savedPaths.length; i++){
          if(user.savedPaths[i].path.toString() === pathId){
            alreadySaved = true;
            return res.status(200).json({message : 'Path already saved'});
          }
        }
        // If that id isn't already saved add it
        if(!alreadySaved){
          let newSavedPath = {path: pathId, hero: path.hero, title: path.title};
          User.findOneAndUpdate({_id : id}, {$push: {savedPaths: newSavedPath}}, {new: true}, (err, doc) => {
            if(err){
              Promise.reject({
                code: 500,
                reason: 'Internal Server Error',
                message: 'Failed to updated user with new saved path',
              });
            } else {
              return res.status(201).json({message: 'Path added to saved paths'});
            }
          });
        }
      });
    })
    .catch((err)=>{
      next(err);
    });
});

// POST a new path to set as in progress to logged in user
// req.body must contain key "pathId" with MongoDB ObjectId as it's value
// Checks if recieved pathId is a saved path and removes it if so
router.post('/start', jwtAuth, (req, res, next) => {
  const { id } = req.user;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
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
      User.findById(id, (err, user) => {
        if(err){
          Promise.reject({
            code: 400,
            reason: 'Bad Request',
            message: `Failed to find user with id ${id}`
          });
        }
        // Check path isn't alredy in completed
        for(let i = 0; i < user.completedPaths.length; i++){
          if(user.completedPaths[i].path.toString() === pathId){
            return res.status(200).json({message : 'Path already completed'});
          }
        }
        // Check path isn't already in current
        for(let i = 0; i < user.currentPaths.length; i++){
          if(user.currentPaths[i].path.toString() === pathId){
            return res.status(200).json({message : 'Path already in progress'});
          }
        }
        // Check that path isn't already saved, remove if so
        for(let i = 0; i < user.savedPaths.length; i++){
          if(user.savedPaths[i].path.toString() === pathId){
            user.savedPaths.splice(i, 1);
          }
        }

        let newCurrentPath = {
          path: pathId, 
          hero: path.hero, 
          title: path.title, 
          totalVideos: path.videos.length, 
          currentVideoIndex: 0,
        };

        user.currentPaths.push(newCurrentPath);

        user.save(() => {
          return res.status(201).json({message: 'Path started'});
        });
      });
    })
    .catch((err)=>{
      next(err);
    });
});

router.post('/display', jwtAuth, (req, res, next) => {
  const { id } = req.user;
  const { pathId } = req.body;
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
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
    })
    .catch((err)=>{
      next(err);
    });
});















// Get the path overview if the user is logged in
router.get('/overview/:id', jwtAuth, (req, res, next) => {
  const { username } = req.user;
  console.log(username);
});

// Get the path overview if no user is logged in
router.get('/guest-overview/:id', (req, res, next) => {
  console.log('no user');
});

module.exports = router;
