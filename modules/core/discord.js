const Discord = require('discord.js');
// const fs = require('fs');

/**
 * ## val discord loader
 *
 * @param {Object} userConfig combined config of modules
 * @param {Object} channels (unused by this core)
 * @param {Function} listenToMessages message listener function
 * @param {Boolean} displayDebugInfo whether to display debug info in the console
 * @param {Object} context bot context to keep things bound together
 * @param {Object} discordConfig discord head options
 *
 * @return {Object} discord chatbot
 */
module.exports = function slackBot(
  userConfig,
  channels,
  listenToMessages,
  displayDebugInfo,
  context,
  discordConfig
) {
  const _bot = new Discord.Client();

  let boundListenToMessages = listenToMessages.bind(context);

  userConfig.commandModules.push(_bot);

  _bot.on('ready', () => {
    console.log(`Logged in as ${_bot.user.tag}!`);

    _bot.say = (to, text, confObj = {}) => {
      const { msg } = confObj;

      if (text) {
        if (msg && msg.reply) {
          msg.reply(text);
        } else {
          console.log('1');
          const msg = new Discord.Message(_bot, text, to);
          console.log('2');
          _bot.send(msg);
          console.log('3');
        }
      }
    };
  });

  _bot.on('message', msg => {
    const confObj = {
      msg,
      // channel: channelName,
      // from: channel,
      // getUserId: getUserId,
      // originalText: text,
      // to: user,
      // user: userName,
    };

    botText = boundListenToMessages(
      msg.author,
      msg.channel,
      msg.content,
      confObj
    );

    _bot.say(msg.channel, botText, confObj);
  });

  /**
   * main bot message listener. reacts to messages and PMs
   */
  // _bot.on('message', message => {
  //   const { bot_id, channel, hidden, text, user } = message;
  //   if (text) {
  //     const isIm = channel[0] === 'D';

  //     let sayFunction;

  //     if (bot_id) {
  //       return null;
  //     } else if (!isIm && !hidden) {
  //       sayFunction = _bot.say.bind(_bot);
  //     } else {
  //       sayFunction = _bot.pm.bind(_bot);
  //     }

  //     const messageMentions = text.match(/<@([Uu][A-Za-z0-9]{4,})>/g);

  //     Promise.all([
  //       isIm ? channel : getHumanChannelName(channel),
  //       getHumanUserName(user),
  //       getHumanMentions(messageMentions, text),
  //     ]).then(([channelName, userName, botText]) => {
  //       const confObj = {
  //         channel: channelName,
  //         from: channel,
  //         getUserId: getUserId,
  //         originalText: text,
  //         to: user,
  //         user: userName,
  //       };

  //       botText = boundListenToMessages(
  //         userName,
  //         channelName,
  //         botText,
  //         confObj
  //       );

  //       if (botText && botText !== '') {
  //         if (typeof botText.then === 'function') {
  //           botText.then(text => {
  //             sayFunction(channel, text, confObj);
  //           });
  //         } else {
  //           sayFunction(channel, botText, confObj);
  //         }
  //       }
  //     });
  //   }
  // });

  // /**
  //  * bot ready listener.  sets proper say and pm functions
  //  */
  // _bot.on('ready', async () => {
  //   _bot.say = (from, botText, confObj) => {
  //     if (confObj) {
  //       from = confObj.from;
  //     }

  //     _bot.sendMessage(botText, from);
  //   };

  //   _bot.pm = (from, botText, confObj) => {
  //     if (confObj) {
  //       from = confObj.from;
  //     }

  //     const message = {
  //       blocks: [
  //         {
  //           type: 'section',
  //           text: {
  //             text: botText,
  //             type: 'mrkdwn',
  //           },
  //         },
  //       ],
  //       channel: from,
  //       as_user: true,
  //     };

  //     web.chat.postMessage(message);
  //   };
  // });

  // _bot.pm = () => {};
  // _bot.say = () => {};

  _bot.login(discordConfig.token);

  return _bot;
};
