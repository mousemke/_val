/**
 * ## Fish!
 *
 * people ordering fish must not be restricted to people that want fish
 *
 * @param {String} to
 * @param {String} from originating channel
 * @param {String} text original text string
 * @param {String} botText
 * @param {Object} _botConfig
 * @param {Object} confObject
 * @param {object} _bot active bot
 *
 * @return {String} original or modified text
 */
function fish(to, from, text, botText, _botConfig, confObj, _bot) {
  if (text && text.toLowerCase().includes('fish!')) {
    return {
      to,
      text: `${_botConfig.trigger}fish`,
      botText,
    };
  }

  return { to, text, botText };
}

module.exports = fish;
