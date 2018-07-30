'use strict';
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
// Models & Schemas
const Path = require('../models/path');
const UserPath = require('../models/userPath');
const Creator = require('../models/creator');
const Videos = require('../models/video');
// Middleware
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.get('/:pathId', jwtAuth, (req, res, next) => {
  const { id } = req.user;
  const { pathId } = req.params;
  
  // Validate, check if valid ObjectId
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  if(!ObjectId.isValid(id)){
    const err = new Error('Provided userId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }

  Path.findById(pathId)
    .populate('videos')
    .populate('creator', 'name')
    .populate({
      path: 'videos',
      populate: {path: 'creator', select: 'name youtube'}
    })
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
      let currPathObj = {
        status : 'none',
        completedVideos : null,
        lastVideoIndex : null,
      }
      UserPath.findOne({userId: id}, (err, userpath) => {
        if(err){
          next(err);
        }
        if(!userpath){
          Promise.reject({
            code: 400,
            reason: 'Bad Request',
            message: `Could not find userPath for userId ${id}`,
          });
        }
        if(userpath.savedPaths.indexOf(pathId) > -1){
          currPathObj.status = 'saved';
          return res.status(200).json({
            ...path.toObject(), 
            ...currPathObj
          });
        } else if(userpath.completedPaths.indexOf(pathId) > -1){
          currPathObj.status= 'completed';
          return res.status(200).json({
            ...path.toObject(), 
            ...currPathObj
          });
        } else {
          for(let currPath of userpath.currentPaths){
            if(currPath.path == pathId){
              currPathObj.status = 'current';
              currPathObj.completedVideos = currPath.completedVideos;
              currPathObj.lastVideoIndex = currPath.lastVideoIndex;
              return res.status(200).json({
                ...path.toObject(), 
                ...currPathObj
              });
            }
          }
          return res.status(200).json({
            ...path.toObject(), 
            ...currPathObj
          });
        }
      })
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;