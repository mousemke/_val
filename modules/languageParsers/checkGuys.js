
const guysObj       = require( '../../lists/guys.js' );

/**
 * ## checkGuys
 *
 * checks for "guys" and/or other words set in the guys.json
 *
 * @param {String} text user text
 *
 * @return {Promise}
 */
function checkGuys( to, text, botText )
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


    let botText         = '';

    guysObj.forEach( obj =>
    {
        obj.triggers.forEach( word =>
        {
            if ( botText === '' )
            {
                let guysRegex   = `(^|\\s)+${word}([\\.!?,\\s]+|$)`;
                guysRegex       = new RegExp( guysRegex, 'i' );

                if ( guysRegex.test( text ) )
                {
                    botText = replaceGuys( to, obj );
                }
            }
        } );
    } );

    return { to, text, botText };
}

export default checkGuys;
