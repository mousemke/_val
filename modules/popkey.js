
module.exports  = function PopKey( _bot, _modules, userConfig )
{
    var apikey      = userConfig.popKeyAPIKey;

    return {

        getGif : function( from, to, text )
        {
            text = text.replace( / /g, ',' ).toLowerCase().replace( /['"`’]/g, '' );
            console.log( text );
            options = {
                path: '/v2/media/search?q=' + text,
                host: 'api.popkey.co',
                port: 443,
                headers: {
                    Authorization: 'Basic ' + apikey,
                    Accept: '*/*'
                }
            };


            _modules.core.apiGet( options, function( info )
            {
                var length = info.length;

                if ( length )
                {
                    var choose = function()
                    {
                        var _r      = Math.floor( Math.random() * length );
                        var _file   =  info[ _r ];

                        var rating = _file.rating;
                        console.log( 'GIF Called.  Rating: ' + rating );

                        if ( rating === 'E' )
                        {
                            return _file.source.url;
                        }
                        else
                        {
                            return choose();
                        }
                    };

                    _bot.say( from, choose() );
                }
                else
                {
                    _bot.say( from, 'Nah.... I got nothing' );
                }
            }, true, from, to );

            return '';
        },


        /**
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
            if ( typeof command !== 'string' )
            {
                command = command[ 0 ];
            }

            var textSplit   = text.split( ' ' ).slice( 1 );

            switch ( command )
            {
                case 'gif':
                    botText = this.getGif( from, to, textSplit.join( ' ' ) );
                    break;
            }

            return botText;
        }
    }
};

