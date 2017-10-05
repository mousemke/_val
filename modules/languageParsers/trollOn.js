
const trollBlacklist = require( '../../lists/trollBlacklist.js' );

/**
 * ## trollOn
 *
 * responds if the word "troll" or "trøll" is in the text.  ignores blacklist items
 *
 * @param {String} text original text string
 *
 * @return {String} original or modified text
 */
function trollOn( to, text, botText, _botConfig )
{
    const textSplit = text.split( ' ' );

    for ( let i = 0, lenI = textSplit.length; i < lenI; i++ )
    {
        if ( trollBlacklist.indexOf( textSplit[ i ] ) !== -1 )
        {
            return { to, text, botText };
        }
    }

    if ( text.toLowerCase().indexOf( 'troll' ) !== -1 )
    {
        text = `${_botConfig.trigger}trollfetti`;
    }
    else if ( text.toLowerCase().indexOf( 'trøll' ) !== -1 )
    {
        text = `${_botConfig.trigger}trøllfetti`;
    }

    return { to, text, botText };
}

module.exports = trollOn;
