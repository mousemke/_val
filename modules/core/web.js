const http = require('http');
const https = require('https');
const qs = require('querystring');

/**
 * ## val web bot
 *
 * @return {Object} web server for chatbot
 */
module.exports = function webBot(
  userConfig,
  channels,
  listenToMessages,
  displayDebugInfo,
  context,
  webConfig
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
    console.log('text', text);
    const botTextObj = {
      status: '200',
      text,
    };

    sendResponse(JSON.stringify(botTextObj), confObj);
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

    const urlSplit = request.url.split('?');
    const url = urlSplit[0];
    const query = urlSplit.slice(1).join('?');
    const queryObj = qs.parse(query);
    const name = queryObj.name || 'anonymous';

    const confObj = {
      name,
      request,
      response,
      url,
      queryObj,
      ip,
    };

    if (request.method === 'GET' && url === '/') {
      const botText = boundListenToMessages(name, ip, queryObj.text, confObj);

      if (botText) {
        if (typeof botText.then === 'function') {
          botText.then(text => {
            _bot.say(ip, text, confObj);
          });
        } else {
          _bot.say(ip, botText, confObj);
        }
      } else {
        const botText = '{"status":"200","text":""}';
        sendResponse(botText, confObj);
      }
    } else {
      const botText =
        '{"status":"403","err":"invalid access (sorry)","text":""}';
      sendResponse(botText, confObj);
    }
  }

  const { botName, isHttps, host, port } = webConfig;


  const _bot = isHttps ? https.createServer(serverFunction) : http.createServer(serverFunction);
  _bot.listen(port);
  _bot.say = say;

  const boundListenToMessages = listenToMessages.bind(context);

  console.warn(`${botName} - ${host}:${port}`);

  return _bot;
};
