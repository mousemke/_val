const mtgBracketNotation = /\[\[[^\[\]]+\]\]/g;

/**
 * ## mtgBrackets
 *
 * grabs [[bracket context]] magic cards and reports them
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
function mtgBrackets(to, from, text, botText, _botConfig, confObj, _bot) {
  const cardsRaw = text.match(mtgBracketNotation);

  if (!cardsRaw) {
    return { to, text, botText };
  }

  const cards = cardsRaw.map(card => card.slice(2).slice(0, -2));

  Promise.all(
    cards.map(card => {
      return new Promise((resolve, reject) => {
        if (_bot.responses.commands.mtg) {
          resolve(_bot.responses.commands.mtg.f(from, to, card, [card]));
        }
      });
    })
  ).then(res => {
    res.forEach(r => _bot.say(confObj.from, r));
  });

  return { to, text, botText };
}

module.exports = mtgBrackets;
