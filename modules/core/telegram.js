
const Telegram  = require( 'telegram-api' );
const Message   = require( 'telegram-api/types/Message' );
const File      = require( 'telegram-api/types/File' );


/**
 * ## val telegram loader
 *
 * @return _Object_ telegram chatbot
 */
module.exports = function telegramBot( userConfig, _bot, channels, listenToMessages, displayDebugInfo, context )
{
    let telegramConfig = userConfig.command.telegram;

    _bot = new Telegram( {
        token   : telegramConfig.apiKey
    } );

    userConfig.commandModules.push( _bot );

    _bot.start();

    let boundListenToMessages = listenToMessages.bind( context );

    _bot.say = ( to, text, confObj ) =>
    {
        let answer = new Message()
                        .text( text )
                        .to( to );

        _bot.send( answer );
    };

    _bot.pm = () => {};

    _bot.get( /./, message =>
    {
        try
        {
            let { text, chat } = message;

            let from    = chat.id;
            let to      = chat[ 'first_name' ] || message.from[ 'first_name' ];
            let botText = text[0] === '/' ? userConfig.trigger + text.slice( 1 ) : text;

            botText     = boundListenToMessages( to, from, botText );

            if ( botText !== '' && botText !== false )
            {
                if ( typeof botText.then === 'function' )
                {
                    botText.then( function( text )
                    {
                        /*
                         * replaces useless telegram identifiers with names
                         */
                        let regex   = new RegExp( chat.id, 'g' );
                        text        = text.replace( regex, chat.title );
                        _bot.say( from, text )
                    } );
                }
                else
                {
                    /*
                     * replaces useless telegram identifiers with names
                     */
                    let regex   = new RegExp( chat.id, 'g' );
                    botText     = botText.replace( regex, chat.title );
                    _bot.say( from, botText );
                }
            }
        }
        catch( e )
        {
            console.error( 'something went wrong ', e );
        }
    } );

    return _bot;
};
