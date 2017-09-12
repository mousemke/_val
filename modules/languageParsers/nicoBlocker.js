
/**
 * ## nicoBlocker
 *
 * pairs with the nico module to block
 *
 * @param {String} to
 * @param {String} text original text string
 * @param {String} botText
 * @param {Object} _botConfig
 *
 * @return {Object} modified values
 */
function nicoBlocker( to, text, botText, _botConfig )
{
    const textSplit = text.split( ' ' );
    const command = textSplit[0];

    const {
        nico,
        nicoFlipped,
        trigger
    } = _botConfig;

    if ( command[0] === trigger && nicoFlipped === true &&
            to === nico && command !== `${trigger}is${nico}flipped?` )
    {
        return {
            to,
            text : '',
            botText : `I'm sorry, ${nico}... I can't hear you while you're flipped`
        };
    }

    return { to, text, botText };
}

module.exports = nicoBlocker;
