/**
 * after a message in a shared channel, this posts the message to all other shared channels
 *
 * @param {String} to
 * @param {String} from originating channel
 * @param {String} text original text string
 * @param {String} botText
 * @param {Object} _botConfig
 * @param {Object} confObject
 * @param {object} _bot active bot
 */
function sharedChannel(to, from, text, botText, _botConfig, confObj, _bot) {
  if (
    _botConfig.sharedChannel.enabled &&
    confObj.from === _botConfig.sharedChannel.channel
  ) {
    _bot.sayShared(to, text, _bot.name);
  }

  return { to, text, botText };
}

module.exports = sharedChannel;
