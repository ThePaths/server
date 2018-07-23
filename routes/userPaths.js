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
      res.json(results[0]);
    })
    .catch(err => next(err));
});

router.put('/save', (req, res, next) => {
  const userId = req.user.id;
  const { pathId } = req.body;

  UserPaths.find({ userId })
    .then(user => {
      Path.findById(pathId, (err, newPath) => {
        let duplicate = false;
        for(let i = 0; i < user[0].savedPaths.length; i++){
          if(user[0].savedPaths[i]._id.toString() === pathId){
            duplicate = true;
            break;
          }
        }
        if(!duplicate){
          user[0].savedPaths.push(newPath);
          user[0].save();
        }
      });
      return user[0];
    })
    .then(result => {
      console.log(result);
      res.json(result);
    })
    .catch(err => next(err));
});

router.put('/display', (req, res, next) => {
  const userId = req.user.id;
  const {pathId} = req.body;

  UserPaths.find({userId})
    .then(user => {
      Path.findById(pathId, (err, newPath) => {
        console.log(newPath);
        const display = {index: 0, title: newPath.title, description: newPath.description, videos: newPath.videos};
        user[0].displayPath = display;
        user[0].save();
      });
      return user[0];
    })
    .then(result => {
      console.log('new: ',result);
      res.json(result);
    })
    .catch(err => next(err));
});



module.exports = router;