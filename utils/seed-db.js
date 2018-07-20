'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const Paths = require('../models/path');
const User = require('../models/user');

const seedPaths = require('../db/seed/questions');
const seedUsers = require('../db/seed/users');

mongoose.connect(DATABASE_URL)
  .then(() => {
    mongoose.connection.db.dropDatabase();
    console.log(DATABASE_URL);
  })
  .then(() => {
    return Promise.all(seedUsers.map(user => User.hashPassword(user.password)));
  })
  .then(digests => {
    seedUsers.forEach((user, i) => user.password = digests[i]);
    return Promise.all([
      Paths.insertMany(seedPaths),
      Paths.createIndexes(),

      User.insertMany(seedUsers),
      User.createIndexes()
    ]);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });