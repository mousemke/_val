
/**
 * a magicthegathering.io search module
 */
// var emojica         = require('../lists/emojica');

module.exports  = function PopKey( _bot, _modules, userConfig )
{
    var apiGet = _modules.core.apiGet;

    return {
        /**
         * ## mtg
         *
         * performs a basic api name search
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {Sring} text original text minus command
         *
         * @return _String_ card image url
         */
        mtg : function( from, to, text )
        {
            var textNoSpaces = text.replace( / /g, '%20' );
            var url = 'https://api.magicthegathering.io/v1/cards?name="' + text + '"';

            return new Promise( ( resolve, reject ) =>
            {
                _modules.core.apiGet( url, function( res )
                {
                    var cards = res.cards;
                    var imageUrl;

                    cards.forEach( _c =>
                    {
                        imageUrl = _c.imageUrl;

                        if ( imageUrl )
                        {
                            resolve( imageUrl );
                        }
                    } );
                }, true, from, to );
            } );
        },


        /**
         * mtg responses
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command )
        {
            var textSplit   = text.split( ' ' ).slice( 1 );

            switch ( command )
            {
                case 'm':
                case 'mtg':
                    botText = this.mtg( from, to, textSplit.join( ' ' ) );
                    break;
            }

            return botText;
        }
    }
};
