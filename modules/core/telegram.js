
/**
 * ## val telegram loader
 *
 * @return _Object_ telegram chatbot
 */
module.exports = function telegramBot( userConfig, _bot, channels, listenToMessages, displayDebugInfo, context )
{
    var Telegram    = require( 'telegram-api' ).default;
    var Message     = require( 'telegram-api/types/Message' );
    var File        = require( 'telegram-api/types/File' );

    var telegramConfig = userConfig.command.telegram;

    _bot = new Telegram( {
        token   : telegramConfig.apiKey
    } );

    userConfig.commandModules.push( _bot );

    _bot.start();

    var boundListenToMessages = listenToMessages.bind( context );

    _bot.say = function( to, text )
    {
        var answer = new Message()
                        .text( text )
                        .to( to );
        _bot.send( answer );
    };


    _bot.get( /./, function( message )
    {
        try
        {
            var text    = message.text
            var chat    = message.chat
            var from    = chat.id;
            var to      = chat[ 'first_name' ] || message.from[ 'first_name' ];
            text        = text[0] === '/' ? userConfig.trigger + text.slice( 1 ) : text;

            var botText = boundListenToMessages( to, from, text );

            if ( botText )
            {
                _bot.say( from, botText );
            }
        }
        catch( e )
        {
            console.log( e );
        }
    } );

    return _bot;
};
