const Telegram = require('telegram-api');
const Message = require('telegram-api/types/Message');
const File = require('telegram-api/types/File');

/**
 * ## val telegram loader
 *
 * @return {Object} telegram chatbot
 */
module.exports = function telegramBot(
  userConfig,
  channels,
  listenToMessages,
  displayDebugInfo,
  context,
  telegramConfig
) {
  const _bot = new Telegram({
    token: telegramConfig.apiKey,
  });

  userConfig.commandModules.push(_bot);

  _bot.start();

  const boundListenToMessages = listenToMessages.bind(context);

  _bot.say = (to, text, confObj) => {
    const answer = new Message().text(text).to(to);

    _bot.send(answer);
  };

  _bot.pm = () => {};

  _bot.get(/./, message => {
    try {
      const { text, chat } = message;

      const from = chat.id;
      const to = chat['first_name'] || message.from['first_name'];
      let botText = text[0] === '/' ? userConfig.trigger + text.slice(1) : text;

      botText = boundListenToMessages(to, from, botText);

      if (botText !== '' && botText !== false) {
        /**
         * ## sayTheThing
         *
         * replaces useless telegram identifiers with names
         *
         * @param {String} text response
         */
        function sayTheThing(text) {
          const regex = new RegExp(chat.id, 'g');
          text = text.replace(regex, chat.title);

          _bot.say(from, text);
        }

        if (typeof botText.then === 'function') {
          botText.then(function(text) {
            sayTheThing(text);
          });
        } else {
          sayTheThing(botText);
        }
      }
    } catch (e) {
      console.error('something went wrong ', e);
    }
  });

  return _bot;
};
