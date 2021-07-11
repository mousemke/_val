const { WebClient } = require('@slack/web-api');
const { App } = require('@slack/bolt');
const fs = require('fs');

/**
 * ## val slack loader
 *
 * @param {Object} userConfig combined config of modules
 * @param {Object} channels (unused by this core)
 * @param {Function} listenToMessages message listener function
 * @param {Boolean} displayDebugInfo whether to display debug info in the console
 * @param {Object} context bot context to keep things bound together
 * @param {Object} slackConfig slack head options
 *
 * @return {Object} slack chatbot
 */
module.exports = function slackBot(
  userConfig,
  channels,
  listenToMessages,
  displayDebugInfo,
  context,
  slackConfig
) {
  const webToken = slackConfig.apiKey;
  const token = slackConfig.oauthToken;
  const signingSecret = slackConfig.signingSecret;
  const appToken = slackConfig.appToken;
  const port = slackConfig.port;
  const { trigger } = userConfig;

  const _bot = new App({
    signingSecret,
    token,
    socketMode: true,
    appToken,
  });
  const web = new WebClient(webToken);

  let boundListenToMessages = listenToMessages.bind(context);

  userConfig.commandModules.push(_bot);

  if (userConfig.cocMessage) {
    const botName = slackConfig.botName;

    const users = getUsersList(botName);

    web.users.list().then(res => {
      res.members
        .map(u => u.id)
        .forEach(id => {
          users[id] = users[id] || false;
        });

      saveUsersList(botName, users);
    });
  }

  /**
   * ## getHumanChannelName
   *
   * @param {String} channel slack channel id
   *
   * @return {String} human readable channel name
   */
  async function getHumanChannelName(channel) {
    return web.conversations.info({ channel }).then(res => res.channel.name);
  }

  /**
   * ## getHumanMentions
   *
   * @param {String} mentions regex found user ids
   * @param {String} text full text
   *
   * @return {String} corrected text
   */
  async function getHumanMentions(mentions, text) {
    if (mentions) {
      return Promise.all(mentions.map(name => getHumanUserName(name))).then(
        nameArr => {
          let correctedText = text;

          mentions.forEach(
            (codeName, i) =>
              (correctedText = correctedText.replace(
                new RegExp(codeName, 'g'),
                nameArr[i]
              ))
          );

          return correctedText;
        }
      );
    }

    return text;
  }

  /**
   * ## getUserId
   *
   * @param {String} username slack user name
   *
   * @return {String} human readable username
   */
  async function getUserId(username) {
    const match = web.users
      .list()
      .then(res => res.members.filter(u => u.name === username)[0])
      .then(a => a.id);

    return match;
  }

  /**
   * ## getHumanUserName
   *
   * @param {String} rawUser slack user id
   *
   * @return {String} human readable username
   */
  async function getHumanUserName(rawUser) {
    const user = rawUser.replace(/^<@|>$/g, '');

    return web.users.info({ user }).then(res => res.user.name);
  }

  /**
   * ## get users list
   *
   * @param {String} botName active bot#s name
   *
   * @return {Object} users list
   */
  function getUsersList(botName) {
    const url = `./json/coc.${botName}.json`;

    try {
      return JSON.parse(fs.readFileSync(url, 'utf8'));
    } catch (e) {
      return {};
    }
  }

  /**
   * ## saveUsersList
   *
   * saves the usernames list for coc reference
   *
   * @param {String} botName active bot#s name
   * @param {Object} users users list
   */
  function saveUsersList(botName, users) {
    const url = `./json/coc.${botName}.json`;

    const usersJSON = JSON.stringify(users);

    fs.writeFileSync(url, usersJSON, 'utf8');

    console.log(`${botName} user list updated`);
  }

  /**
   * main bot message listener. reacts to messages and PMs
   */
  _bot.message(/./, async ({ message, say }) => {
    const { bot_id, channel, text, user } = message;

    const isDm = channel[0] === 'D';

    if (bot_id) {
      return null;
    }

    const messageMentions = text.match(/<@([Uu][A-Za-z0-9]{4,})>/g);

    Promise.all([
      isDm ? channel : getHumanChannelName(channel),
      getHumanUserName(user),
      getHumanMentions(messageMentions, text),
    ]).then(async ([channelName, userName, botText]) => {
      const confObj = {
        channel: channelName,
        from: channel,
        getUserId: getUserId,
        originalText: text,
        to: user,
        user: userName,
      };

      botText = boundListenToMessages(userName, channelName, botText, confObj);

      if (botText && botText !== '') {
        if (typeof botText.then === 'function') {
          botText.then(async text => {
            await say(text);
          });
        } else {
          await say(botText);
        }
      }
    });
  });

  /**
   * team_join listener. sends out CoC and welcome messages
   */
  _bot.action('team_join', async info => {
    const id = info.user;

    if (userConfig.cocMessage) {
      const botName = slackConfig.botName;
      const users = getUsersList(botName);

      users[id] = users[id] || false;

      saveUsersList(botName, users);
    }

    const userName = await getHumanUserName(id);

    const { welcomeMessage } = slackConfig;

    let botText = boundListenToMessages(userName, id, `${trigger}coc`, {});

    if (welcomeMessage) {
      botText = `Hello ${userName}, ${welcomeMessage}\n\n${botText}`;
    }

    if (botText) {
      _bot.say(id, botText);
    }
  });

  _bot.say = async (channel, text) =>
    await web.chat.postMessage({
      text,
      channel,
    });

  (async () => {
    await _bot.start(port);
  })();

  return _bot;
};
