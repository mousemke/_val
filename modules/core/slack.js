const slack = require('@slack/client');
const { RTMClient, WebClient } = slack;

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

  _bot.on('message', message => {
    const { type, subtype, hidden } = message;

    if (!hidden && message.user && message.channel) {
      const from = message.channel;
      const to = message.user;
      const messageText = message.text;

      /*
       * replaces useless slack identifiers with names
       */
      const messageMentions = messageText.match(/<@([Uu][A-Za-z0-9]{4,})>/g);

      function getHumanChannelName(channel) {
        if (channel[0] !== 'G') {
          return web.channels.info({ channel }).then(res => res.channel.name);
        }

        return web.conversations
          .info({ channel })
          .then(res => res.channel.name);
      }

      function getHumanUserName(rawUser) {
        const user = rawUser.replace(/^<@|>$/g, '');

        return web.users.info({ user }).then(res => res.user.name);
      }

      function getHumanMentions(mentions, text) {
        if (messageMentions) {
          return Promise.all(
            messageMentions.map(name => getHumanUserName(name))
          ).then(nameArr => {
            let correctedText = messageText;

            messageMentions.forEach(
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

      Promise.all([
        getHumanChannelName(message.channel),
        getHumanUserName(to),
        getHumanMentions(messageMentions, messageText),
      ]).then(([channel, user, botText]) => {
        const confObj = {
          to,
          from,
          user,
          channel,
        };

        botText = boundListenToMessages(user, channel, botText, confObj);

        if (botText && botText !== '') {
          if (subtype === 'message_changed') {
            _bot.updateMessage(msg, (err, res) => {
              msg.text = 'test message update';
            });
          } else if (typeof botText.then === 'function') {
            // refactor to use message updating?
            // https://github.com/slackhq/node-slack-sdk#update-messages
            botText.then(text => {
              _bot.say(from, text, confObj);
            });
          } else {
            _bot.say(from, botText, confObj);
          }
        }
      });
    }
  });

  _bot.on('ready', () => {
    _bot.pm = (to, botText, confObj) => {
      if (confObj) {
        to = confObj.to;
      }

      _bot._modules.core.apiGet(
        `https://slack.com/api/im.open?token=${token}&user=${to}`,
        res => {
          const id = res.channel.id;

          _bot.sendMessage(botText, id);
        }
      );
    };

    _bot.say = (from, botText, confObj) => {
      if (confObj) {
        from = confObj.from;
      }

      _bot.sendMessage(botText, from);
    };
  });

  _bot.pm = () => {};
  _bot.say = () => {};

  _bot.start();

  return _bot;
};
