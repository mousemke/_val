
/**
 * a magicthegathering.io search module
 */
module.exports  = function PopKey( _bot, _modules, userConfig, commandModule )
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
            var url = `https://api.magicthegathering.io/v1/cards?name="${text}"`;

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
         * @param {Object} confObj extra config object that some command modules need
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command, confObj )
        {
            var textSplit   = text.split( ' ' ).slice( 1 );

            switch ( command )
            {
                case 'm':
                case 'mtg':
                    return this.mtg( from, to, textSplit.join( ' ' ) );
            }

            return botText;
        }
    }
};
