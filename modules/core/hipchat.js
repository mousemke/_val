// https://hipchat.zalando.net/v2/room/7543/notification?auth_token=

/*
{
    "event": "room_message",
    "item": {
        "message": {
            "date": "2017-11-21T15:25:07.034544+00:00",
            "from": {
                "id": 419,
                "links": {
                    "self": "https://hipchat.zalando.net/v2/user/419"
                },
                "mention_name": "\u207f\u2071\u1d9c\u1d52",
                "name": "Nico Sorger",
                "version": "69WSRPTF"
            },
            "id": "ef22f8e1-72d6-4cdc-ba20-b77baccd2e9f",
            "mentions": [],
            "message": "/+ m moon moon",
            "type": "message"
        },
        "room": {
            "id": 7543,
            "is_archived": false,
            "links": {
                "participants": "https://hipchat.zalando.net/v2/room/7543/participant",
                "self": "https://hipchat.zalando.net/v2/room/7543",
                "webhooks": "https://hipchat.zalando.net/v2/room/7543/webhook"
            },
            "name": "#guild-mtg",
            "privacy": "public",
            "version": "CKWRXOI4"
        }
    },
    "oauth_client_id": "110acc36-68fa-4eff-8c07-d6e72fe05573",
    "webhook_id": 3046
}
*/

const http = require('http');
const request = require('request');

/**
 * ## val web bot
 *
 * @return {Object} web server for chatbot
 */
module.exports = function hipchatBot(
  userConfig,
  channels,
  listenToMessages,
  displayDebugInfo,
  context,
  hipchatConfig
) {
  /**
   * ## sendResponse
   *
   * completes the http response
   *
   * @param {Object} data response data to output
   * @param {Object} cookies cookies to add to the header (opt)
   */
  function sendResponse(data, { request, response }) {
    const headers = [
      ['access-control-allow-origin', request.headers.origin || '*'],
      ['Content-Type', 'application/json'],
      ['content-length', data.length],
    ];

    response.writeHead('200', 'OK', headers);

    response.write(data);
    response.end();
  }

  /**
   * ## say
   *
   * gets attached to the server as _bot.say
   *
   * @param {String} from user
   * @param {String} text botText to post
   * @param {Object} confObj request, response and any other necessary data
   */
  function say(from, text, confObj) {
    const botTextObj = {
      color: hipchatConfig.color,
      message: text,
      notify: false,
      message_format: 'text',
    };

    if (
      confObj &&
      confObj.data &&
      confObj.data.item &&
      confObj.data.item.room &&
      confObj.data.item.room.links &&
      confObj.data.item.room.links.self
    ) {
      const url = confObj.data.item.room.links.self;

      request(
        {
          method: 'POST',
          json: botTextObj,
          headers: { 'content-type': 'application/json' },
          url: `${url}/notification?auth_token=${hipchatConfig.token}`,
        },
        function(error, response, body) {
          if (!error && response.statusCode === 200) {
            console.log('yay!');
          }
        }
      );
    }
  }

  /**
   * ## serverFunction
   *
   * actual server
   *
   * @param {Object} request
   * @param {Object} response
   */
  function serverFunction(request, response) {
    const ip =
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress;

    if (request.method === 'POST') {
      let body = '';

      request.on('data', chunk => {
        body += chunk;
      });

      request.on('end', () => {
        const data = JSON.parse(body);

        const messageObj = data.item.message;
        const fromObj = messageObj.from;
        const name = fromObj.name;
        const message = messageObj.message
          .slice(1)
          .replace(`${userConfig.trigger} `, userConfig.trigger)
          .trim();

        const confObj = {
          data,
          name,
          request,
          response,
          ip,
        };

        const botText = boundListenToMessages(name, ip, message, confObj);

        if (botText) {
          if (typeof botText.then === 'function') {
            botText.then(text => {
              _bot.say(ip, text, confObj);
            });
          } else {
            _bot.say(ip, botText, confObj);
          }
        }

        sendResponse('{"status":"200","text":""}', confObj);
      });
    } else {
      const botText =
        '{"status":"403","err":"invalid access (sorry)","text":""}';
      sendResponse(botText, confObj);
    }
  }

  const { botName, host, port } = hipchatConfig;

  const _bot = http.createServer(serverFunction);
  _bot.listen(port);
  _bot.say = say;

  const boundListenToMessages = listenToMessages.bind(context);

  console.warn(`${botName} - ${host}:${port}`);

  return _bot;
};
