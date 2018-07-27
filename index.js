'use strict';
// Config & enviorment variables
require('dotenv').config();
const { PORT, CLIENT_ORIGIN } = require('./config');
// Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const { dbConnect } = require('./db-mongoose');
// Authentication Strategies
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

// Initializing Express App
const app = express();
app.use(express.json());

// Morgan logging middleware
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// Enable Cross-Origin Resource Sharing
app.use(
  cors(/*{
    origin: CLIENT_ORIGIN // Uncomment to restrict cors access
  }*/)
);

// Add strategies to passport authentication
passport.use(localStrategy);
passport.use(jwtStrategy);

// Enable routers
app.use('/api/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/api/paths', require('./routes/paths'));
app.use('/api/userpaths', require('./routes/userpaths'));
app.use('/api/overview', require('./routes/overview'));
app.use('/api/dashboard', require('./routes/dashboard'));

// 404(Not Found) error handling
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all non-404 error handling
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
