/**
 * ## !alias
 *
 * triggers an alias with the format !${alias}
 *
 * @param {String} to
 * @param {String} from originating channel
 * @param {String} text original text string
 * @param {String} botText
 * @param {Object} _botConfig
 * @param {Object} confObject
 * @param {object} _bot active bot
 *
 * @return {String} original or modified text object
 */
function alias(to, from, text, botText, _botConfig, confObj, _bot) {
  if (text) {
    const textArr = text.split(' ');
    const activeAlias = textArr
      .map(t => (t[0] === '!' ? t.slice(1) : null))
      .filter(Boolean);

    if (activeAlias.length !== 0) {
      _bot.say(
        confObj.from,
        _bot.responses.commands.useAlias.f(from, to, text, activeAlias)
      );
    }
  }

  return { to, text, botText };
}

module.exports = alias;
