
const trollBlacklist = require( '../../lists/trollBlacklist.js' );

/**
 * ## trollOn
 *
 * responds if the word "troll" or "trøll" is in the text.  ignores blacklist items
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
function trollOn( to, from, text, botText, _botConfig, confObj, _bot )
{
    const textSplit = text.split( ' ' );

    for ( let i = 0, lenI = textSplit.length; i < lenI; i++ )
    {
        if ( trollBlacklist.indexOf( textSplit[ i ].replace( /[^A-Za-z0-9]/, '' ).toLowerCase() ) !== -1 )
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
