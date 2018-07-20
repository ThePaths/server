'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const { DATABASE_URL } = require('../config');

const Paths = require('../models/path');
const seedPaths = require('../db/seed/questions');

mongoose.connect(DATABASE_URL)
  .then(() => {
    mongoose.connection.db.collection('paths').drop();
    console.log(DATABASE_URL);
  })
  .then(() => {
    return Promise.all([
      Paths.insertMany(seedPaths),
      Paths.createIndexes()
    ]);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });