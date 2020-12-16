const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const isReachable = require('is-reachable');

const api_key_missing = '*You didn\'t provide a valid api key* || field \'api_key\' is missing';

router.post('/process', async function (req, res) {
  res.status(200).end();
  const { user_name, command, response_url } = req.body;

  const parameters = req.body.text.split(' ');

  const accepted_error_codes = [2001, 1020, 2003, 1005, 1006, 1002];

  if (parameters && parameters[0] === 'help') {
    return await send_help_to_slack(response_url);
  }

  if (parameters.length < 3) return await send_response_back_to_slack(response_url, "in_channel", "One or more parameters are missing, right format is */restart <server_name> <api_key> <error_code>*, you can get more infos about this command by running */restart help*");
  if (parameters[1] !== process.env.SLACK_API_KEY) return await send_response_back_to_slack(response_url, "in_channel", api_key_missing);
  if (isNaN(parameters[2]) || (parameters[2] && !accepted_error_codes.includes(Number(parameters[2])))) return await send_response_back_to_slack(response_url, "in_channel", "Parameter *<error_code>* must be type of Number. *Options are [2001, 1020, 2003, 1005, 1006, 1002]*");

  const server_name = parameters[0];
  const server_url = `http://${server_name}.beecome.io:5555`;
  const error_code = parameters[2];

  if (Number(error_code) === 1002) return await send_response_back_to_slack(response_url, "in_channel", "*Warning* At the moment error code *1002: Could not make a WebSocket connection* can't be processsed by the bot thus *require manual operations*, contact a system administrator in order to fix this problem.");

  try {

    await axios.post(response_url, {
      "text": `Command *${command}* has been triggered by *${user_name}*. Thanks for your request, we'll process it and get back to you.`,
      "response_type": "ephemeral"
    });

    if (await isReachable(server_url)) {
      const url_endp = `${server_url}/restart/error_dev`;

      const response = await axios.get(url_endp, {
        headers: {
          'api_key': process.env.API_KEY
        },
        data: {
          error_code: error_code
        }
      });

      if (!response.data.error) {
        return await send_response_back_to_slack_after_done(response_url, "in_channel", `Command *${command}* triggered by *${user_name}* for error: *${error_code}* has been *successfully executed*.`, response.data.cmd, server_name);
      } else {
        return await send_response_back_to_slack_after_done(response_url, "in_channel", `*Oops, an error occured*, the operation couldn\'t be processed. *Error: ${response.data.text}*`, response.data.cmd, server_name);
      }
    } else {
      return await send_response_back_to_slack_after_done(response_url, "in_channel", 'Server is not reachable, manual modifications are required', 'undefined', server_name);
    }
  } catch (error) {
    console.log(error);
    return await send_response_back_to_slack_after_done(response_url, 'in_channel', JSON.stringify(error), 'undefined', server_name);
  }
});

router.post('/process_media', async function (req, res) {
  res.status(200).end();
  const { user_name, command, response_url } = req.body;

  const parameters = req.body.text.split(' ');

  const accepted_error_types = ["audio", "video"];

  if (parameters && parameters[0] === 'help') {
    return await send_help_to_slack(response_url);
  }

  if (parameters.length < 3) return await send_response_back_to_slack(response_url, "in_channel", "One or more parameters are missing, right format is */restart <server_name> <api_key> <error_type>*, you can get more infos about this command by running */restart help*");
  if (parameters[1] !== process.env.SLACK_API_KEY) return await send_response_back_to_slack(response_url, "in_channel", api_key_missing);
  if (!parameters[2] || (parameters[2] && !accepted_error_types.includes(parameters[2]))) return await send_response_back_to_slack(response_url, "in_channel", "Parameter *<error_type>*. *Options are ['audio', 'video']*");

  const server_name = parameters[0];
  const server_url = `http://${server_name}.beecome.io:5555`;
  const error_type = parameters[2];

  try {

    await axios.post(response_url, {
      "text": `Command *${command}* has been triggered by *${user_name}*. Thanks for your request, we'll process it and get back to you.`,
      "response_type": "ephemeral"
    });

    if (await isReachable(server_url)) {
      const url_endp = `${server_url}/restart/error_muggles`;

      const response = await axios.get(url_endp, {
        headers: {
          'api_key': process.env.API_KEY
        },
        data: {
          error_codes: error_type === 'video' ? ['1020'] : ['1005']
        }
      });

      if (!response.data.error) {
        return await send_response_back_to_slack_after_done(response_url, "in_channel", `Command *${command}* triggered by *${user_name}* for error_type: *${error_type}* has been *successfully executed*.`, response.data.cmd, server_name);
      } else {
        return await send_response_back_to_slack_after_done(response_url, "in_channel", `*Oops, an error occured*, the operation couldn\'t be processed. *Error: ${response.data.text}*`, response.data.cmd, server_name);
      }
    } else {
      return await send_response_back_to_slack_after_done(response_url, "in_channel", 'Server is not reachable, manual modifications are required', 'undefined', server_name);
    }
  } catch (error) {
    return await send_response_back_to_slack_after_done(response_url, 'in_channel', JSON.stringify(error), 'undefined', server_name);
  }
});

async function send_response_back_to_slack(response_url, response_type, text) {
  return await axios.post(response_url, {
    text: text,
    response_type: response_type
  });
}

async function send_response_back_to_slack_after_done(response_url, response_type, text, cmd, server_name) {
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
          "text": `*Command executed:* ${cmd}`
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
          "text": "*Command Schema*: /restart <server_name> <api_key> <error_type>"
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
          "text": "*<error_type>*: Must be one of ['video', 'audio']"
        }
      }
    ]
  });
}


module.exports = router;
