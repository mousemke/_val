
var http            = require( 'http' ),
    https           = require( 'https' );
    xkcdFetchUrl    = 'http://xkcd-imgs.herokuapp.com/';

module.exports  = function XKCD( _bot, apiGet, userData, userConfig, doge )
{
    return {

        getComic : function( from, to, text, botText )
        {
            apiGet( xkcdFetchUrl, function( response )
            {
                _bot.say( from, response.url + '\n' + response.title );

            }, false );
        },


        responses : function( from, to, text, botText )
        {
            if ( text[0] === '.' )
            {
                text = text.slice( 1 );
            }

            var command = text.split( ' ' )[ 0 ];

            switch ( command )
            {
                case 'xkcd':
                    this.getComic( from, to, text );
                    break;
            }

            return botText;
        }
    };
};
