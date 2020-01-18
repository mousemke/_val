const { WebClient } = require('@slack/web-api');
const { RTMClient } = require('@slack/rtm-api');

/**
 * ## val slack loader
 *
 * https://api.slack.com/methods/im.open
 * https://github.com/slackhq/node-slack-sdk
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
  const token = slackConfig.apiKey;
  const _bot = new RTMClient(token);
  const web = new WebClient(token);

  let boundListenToMessages = listenToMessages.bind(context);

  userConfig.commandModules.push(_bot);

  /**
   * ## getHumanChannelName
   *
   * @param {String} channel slack channel id
   *
   * @return {String} human readable channel name
   */
  async function getHumanChannelName(channel) {
    if (channel[0] !== 'G') {
      return web.channels.info({ channel }).then(res => res.channel.name);
    }

    return web.conversations
      .info({ channel })
      .then(res => res.channel.name);
  }

  async function getHumanMentions(mentions, text) {
    if (mentions) {
      return Promise.all(
        mentions.map(name => getHumanUserName(name))
      ).then(nameArr => {
        let correctedText = text;

        mentions.forEach(
          (codeName, i) =>
            (correctedText = correctedText.replace(
              new RegExp(codeName, 'g'),
              nameArr[i]
            ))
        );

        return correctedText;
      });
    }

    return text;
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

  // _bot.on('team_join', async (info) => {
  _bot.on('member_joined_channel', async (info) => {
    const id = info.user;
    const userName = await getHumanUserName(id);

    const { trigger } = userConfig;
    const {
      codeOfConductMessage,
      welcomeMessage,
    } = slackConfig;

    botText = boundListenToMessages(userName, id, `${trigger}coc`, {});

    if (welcomeMessage) {
      botText = `Hello ${userName}, ${welcomeMessage}\n\n${botText}`;
    }

    if (botText) {
      _bot.pm(id, botText)
    }
  });

  /**
   * main bot message listener. reacts to messagds and PMs
   */
  _bot.on('message', message => {
    const {
      bot_id,
      channel,
      hidden,
      text,
      user,
    } = message;
    const isIm = channel[0] === 'D';

    let sayFunction;

    if (bot_id) {
      return null;
    } else if (!isIm && !hidden) {
      sayFunction = _bot.say.bind(_bot);
    }
    else {
      sayFunction = _bot.pm.bind(_bot);
    }

    const messageMentions = text.match(/<@([Uu][A-Za-z0-9]{4,})>/g);

    Promise.all([
      isIm ? channel : getHumanChannelName(channel),
      getHumanUserName(user),
      getHumanMentions(messageMentions, text),
    ]).then(([channelName, userName, botText]) => {
      const confObj = {
        to: user,
        from: channel,
        user: userName,
        channel: channelName,
        originalText: text,
      };

      botText = boundListenToMessages(userName, channelName, botText, confObj);

      if (botText && botText !== '') {
        if (typeof botText.then === 'function') {
          botText.then(text => {
            sayFunction(channel, text, confObj);
          });
        } else {
          sayFunction(channel, botText, confObj);
        }
      }
    });
  });

  /**
   * bot ready listener.  sets proper say and pm functions
   */
  _bot.on('ready', async () => {
    _bot.say = (from, botText, confObj) => {
      if (confObj) {
        from = confObj.from;
      }

      _bot.sendMessage(botText, from);
    };

    _bot.pm = (from, botText, confObj) => {
      if (confObj) {
        from = confObj.from;
      }

      const message = {
        blocks: [
          {
            type: 'section',
            text: {
              text: botText,
              type: 'mrkdwn',
            },
          },
        ],
        channel: from,
        as_user: true,
      }

      web.chat.postMessage(message);
    };
  });

  _bot.pm = () => {};
  _bot.say = () => {};

  _bot.start();

  return _bot;
};
