
const guysObj       = require( '../../lists/guys.js' );

/**
 * ## checkGuys
 *
 * checks for "guys" and/or other words set in the guys.json
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
function checkGuys( to, from, text, botText, _botConfig, confObj, _bot )
{
    /**
     * ## replaceGuys
     *
     * responds to 'guys' (and other trigger words) with alternative suggestions
     *
     * @param {String} to user
     * @param {Object} obj triggered word object
     *
     * @return {String} suggestion
     */
    function replaceGuys( to, obj )
    {
        const alternative   = obj.alternatives[ Math.floor( Math.random() *
                                                    obj.alternatives.length ) ];

        const speech        = obj.speech[ Math.floor( Math.random() *
                                                    obj.speech.length ) ];

        return `${to}, ${speech[ 0 ]}${alternative}${speech[ 1 ]}`;
    }


    let newBotText = '';

    guysObj.forEach( obj =>
    {
        obj.triggers.forEach( word =>
        {
            if ( newBotText === '' )
            {
                let guysRegex   = `(^|\\s)+${word}([\\.!?,\\s]+|$)`;
                guysRegex       = new RegExp( guysRegex, 'i' );

                if ( guysRegex.test( text ) )
                {
                    newBotText = replaceGuys( to, obj );
                }
            }
        } );
    } );

    botText = newBotText === '' ? botText : newBotText;

    return { to, text, botText };
}

module.exports = checkGuys;
