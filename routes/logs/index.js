const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const isReachable = require('is-reachable');

const api_key_missing = '*You didn\'t provide a valid api key* || field \'api_key\' is missing';

router.post('/gen', async function (req, res) {
  res.status(200).end();
  const { user_name, command, response_url } = req.body;

  const parameters = req.body.text.split(' ');

  const accepted_error_lvls = ['debug', 'info', 'notice', 'warn', 'error', 'crit', 'alert', 'emerg'];

  if (parameters && parameters[0] === 'help') {
    return await send_help_to_slack(response_url);
  }

  if (parameters.length < 3) return await send_response_back_to_slack(response_url, "in_channel", "One or more parameters are missing, right format is */get_logs <server_name> <api_key> <error_lvl>*, you can get more infos about this command by running */get_logs help*");
  if (parameters[1] !== process.env.SLACK_API_KEY) return await send_response_back_to_slack(response_url, "in_channel", api_key_missing);
  if (isNaN(parameters[2]) || (parameters[2] && !accepted_error_lvls.includes(parameters[2]))) return await send_response_back_to_slack(response_url, "in_channel", "Parameter *<error_lvl>* must be type of String. *Options are ['debug', 'info', 'notice', 'warn', 'error', 'crit', 'alert', 'emerg']*");

  const server_name = parameters[0];
  const server_url = `http://${server_name}.beecome.io:5555`;
  const error_lvl = parameters[2];

  try {

    await axios.post(response_url, {
      "text": `Command *${command}* has been triggered by *${user_name}*. Thanks for your request, we'll process it and get back to you.`,
      "response_type": "ephemeral"
    });

    if (await isReachable(server_url)) {
      const url_endp = `${server_url}/get_logs/logs_dev`;

      const response = await axios.get(url_endp, {
        headers: {
          'api_key': process.env.API_KEY
        },
        data: {
          error_level: error_lvl
        }
      });

      if (!response.data.error) {
        return await send_response_back_to_slack_after_done(response_url, "in_channel", `Command *${command}* triggered by *${user_name}* for logs of type: *${error_lvl}* has been *successfully executed*.`, server_name);
      } else {
        return await send_response_back_to_slack_after_done(response_url, "in_channel", `*Oops, an error occured*, the operation couldn\'t be processed. *Error: ${response.data.text}*`, server_name);
      }
    } else {
      return await send_response_back_to_slack_after_done(response_url, "in_channel", 'Server is not reachable, manual modifications are required', 'undefined', server_name);
    }
  } catch (error) {
    console.log(error);
    return await send_response_back_to_slack_after_done(response_url, 'in_channel', JSON.stringify(error), 'undefined', server_name);
  }
});

async function send_response_back_to_slack(response_url, response_type, text) {
  return await axios.post(response_url, {
    text: text,
    response_type: response_type
  });
}

async function send_response_back_to_slack_after_done(response_url, response_type, text, server_name) {
  return await axios.post(response_url, {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*Server name:* ${server_name}`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": text
        }
      }
    ],
    response_type: response_type
  });
}

async function send_help_to_slack(response_url) {
  return await axios.post(response_url, {
    "response_type": "in_channel",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Help has been triggered*"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Command Schema*: /get_logs <server_name> <api_key> <error_lvl>"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*<server_name>*: egc => visio2, visio4 ..."
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*<api_key>*: The key provided by the api administrator"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*<error_lvl>*: Must be one of ['debug', 'info', 'notice', 'warn', 'error', 'crit', 'alert', 'emerg']"
        }
      }
    ]
  });
}

module.exports = router;
