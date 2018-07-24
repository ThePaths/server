'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;

const Path = require('../models/path');
const User = require('../models/user');
const UserPath = require('../models/userPath');
const Creator = require('../models/creator');
const Video = require('../models/video'); // Used by populate

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });



router.get('/:pathId', jwtAuth, (req, res, next) => {
  const { id } = req.user;
  const { pathId } = req.params;

  // Validate
  if(!ObjectId.isValid(pathId)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }
  if(!ObjectId.isValid(id)){
    const err = new Error('Provided pathId is not a valid ObjectId');
    err.status = 400;
    return next(err);
  }

  Path.findById(pathId)
    .populate('videos')
    .populate('creator', 'name')
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
            if(currPath.pathId == pathId){
              Object.assign(currPathObj, {status : 'current'});
              currPathObj.completedVideos = currPath.completedVideos;
              currPathObj.lastVideoIndex = currPath.lastVideoIndex;
              console.log(currPathObj.status + '1');
              return res.status(200).json({
                ...path.toObject(), 
                ...currPathObj
              });
            }
          }
          console.log('default return')
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
    





  // User.findById(id)
  //   .then(user => {
  //     let returnPath = {};
  //     for(let i = 0; i < user.currentPaths.length; i++){
  //       if(user.currentPaths[i].path.toString() === pathId){
  //         returnPath.currentVideoIndex = user.currentPaths[i].currentVideoIndex;
  //         returnPath.totalVideos = user.currentPaths[i].totalVideos;
  //         break;
  //       }
  //     }
  //     Path.findById(pathId, (err, doc) => {
  //       // Add err handling
  //       returnPath.videos = doc.videos;
  //       returnPath.title = doc.title;
  //       returnPath.pathCreator = doc.pathCreator;
  //       return res.json(returnPath);
  //     });
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

module.exports = router;