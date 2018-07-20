const express = require('express');
const router = express.Router();

const Path = require('../models/path');

router.get('/', (req, res, next) => {
  Path.find()
    .sort('title')
    .then(paths => {
      res.json(paths);
    })
    .catch(err => next(err));
});

module.exports = router;