const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const isReachable = require('is-reachable');

const api_key_missing = 'You didn\'t provide a valid api key || field \'api_key\' is missing';


router.get('/restart', async function (req, res) {
  const parameters = req.body.text.split(' ');
  console.log(parameters);
  res.status(200);
  // if (!req.body['api_key'] || req.headers['api_key'] !== process.env.SLACK_API_KEY) {
  //   return res.send({ status: 400, error: api_key_missing });
  // }
  // hdUsage.GetDiskInfo()
  //   .then(disk_info => res.send({ disk_info }))
  //   .catch(err => res.send({ status: 400, error: err }));
});


module.exports = router;
