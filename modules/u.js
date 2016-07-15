
/**
 * the u conversations
 *
 * based on http://www.flashforwardpod.com/2016/04/05/episode-10-rude-bot-rises/ (5:30)
 *
 * @author  Mouse Braun <mouse@knoblau.ch>
 *
 * @for _val <git@github.com:mousemke/_val.git>
 *
 * @param {Object} _bot node irc bot instance
 * @param {Object} _modules all the modules (including this one)
 * @param {Object} userConfig config options
 */
var words       = require( '../json/u.json' );

module.exports = function U( _bot, _modules, userConfig )
{
    return {

        talk : function( from, to, textSplit )
        {
            var _w, _ts, res = [];

            for ( var i = 0, lenI = textSplit.length; i < lenI; i++ )
            {
                _ts = textSplit[ i ].replace( /\W/g, '' ).toLowerCase();

                words.forEach( function( _w )
                {
                    _wSmall     = _w.replace( /[^\da-zA-Z\s]/g, '' ).toLowerCase();

                    if ( _wSmall.indexOf( _ts ) !== -1 && res.indexOf( _wSmall ) === -1 )
                    {
                        res.push( _w );
                    }
                } );
            }

            return res.length !== 0 ? res[ Math.floor( Math.random() * res.length ) ] : '';
        },


        /**
         * Responses
         **/
        responses : function( from, to, text, botText, command )
        {
            var textSplit   = text.split( ' ' ).slice( 1 );

            switch ( command )
            {
                case 'u':
                    return this.talk( from, to, textSplit );
            }

            return botText;
        }
    };
};