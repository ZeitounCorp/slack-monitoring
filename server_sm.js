require('dotenv').config();
const port = process.env.PORT || 8142;

// Express service
const express = require('express');
const app = express();

// Format responses and requests to json 
app.use(express.json());

/**
 * Routes' imports 
 */
const LOGS = require('./routes/logs');
const ERRORS = require('./routes/errors');
/**
 * Routes Middleware
 */
app.use('/logs', LOGS); // Get logs for a given server
app.use('/restart', ERRORS); // Routes for restarting a given process in case of an error

/**
 *  Launching the api
 */
app.listen(port, () => { console.log('API is up and running'); });

module.exports = app;
