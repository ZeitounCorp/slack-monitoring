require('dotenv').config();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8142;

// Express service
const express = require('express');
const app = express();

// Need to parse the request using url encoded because of how slack send us the data (application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

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
