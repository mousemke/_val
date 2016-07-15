
module.exports  = function PopKey( _bot, _modules, userConfig )
{
    var apikey      = userConfig.popKeyAPIKey;

    return {

        getGif : function( from, to, text )
        {
            text = text.replace( / /g, ',' ).toLowerCase().replace( /['"`’]/g, '' );

            options = {
                path: '/v2/media/search?q=' + text,
                host: 'api.popkey.co',
                port: 443,
                headers: {
                    Authorization: 'Basic ' + apikey,
                    Accept: '*/*'
                }
            };

            return new Promise( function( resolve, reject )
            {
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

                        resolve( choose() );
                    }
                    else
                    {
                        resolve( 'Nah.... I got nothing' );
                    }
                }, true, from, to );

            } );
        },


        /**
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
            if ( typeof command !== 'string' )
            {
                command = command[ 0 ];
            }

            var textSplit   = text.split( ' ' ).slice( 1 );

            switch ( command )
            {
                case 'gif':
                    return this.getGif( from, to, textSplit.join( ' ' ) );
            }

            return botText;
        }
    }
};

