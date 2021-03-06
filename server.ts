﻿/// <reference path="./.types/node/node.d.ts" />

// load environment variables from a .env file, if it exists
var dotenv = require('dotenv');
dotenv.load();

import http = require('http');
import app = require('./src/app');
var log = require('./src/log');

var environment = process.env.NODE_ENV || 'development';

if (environment == 'production') {
  // New Relic
  require('newrelic');
  // Logentries
  var winston = require('winston');
  var logentries = require('node-logentries');
  logentries.logger({
    token: process.env.LOGENTRIES_TOKEN
  }).winston(winston, {});
  log.add(winston.transports.LogentriesLogger);
}

log.info('Running in environment ' + environment);

var appOpts = {
  environment: environment,
  port: process.env.PORT || 3000,
  dbType: 'mongodb',
  mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/valtech-shortie?w=1',
  sessionSecret: process.env.SESSION_SECRET || 'TODO: create some better secret',
  sessionDuration: 24 * 60 * 60 * 1000, // valid for 1 day
  sessionActiveDuration: 5 * 60 * 1000, // sliding expiration for 5 minutes
  sessionUseSecureCookie: false
};


app.create(appOpts, function (err, app) {
  if (err) {
    return log.error('app create error', err.stack);
  }
  http.createServer(app).listen(app.get('port'), function () {
    log.info('Shortie server listening on port ' + app.get('port'));
  });
});
