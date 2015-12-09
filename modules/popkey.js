
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


        responses : function( from, to, text, botText )
        {

            var textSplit = text.split( ' ' );
            var command = textSplit[ 0 ].slice( 1 );

            if ( typeof command !== 'string' )
            {
                command = command[ 0 ];
            }

            switch ( command )
            {
                case 'gif':
                    botText = this.getGif( from, to, textSplit.slice( 1 ).join( ' ' ) );
                    break;
            }

            return botText;
        }
    }
};

