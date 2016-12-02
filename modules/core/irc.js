
const Irc = require( 'irc' );

/**
 * ## val irc loader
 *
 * @return {Object} irc chatbot
 */
module.exports = function ircBot( userConfig, channels, listenToMessages, displayDebugInfo, context, ircConfig )
{
    const _bot = new Irc.Client( ircConfig.server, ircConfig.botName, {
        channels                : channels,
        password                : ircConfig.serverPassword,
        showErrors              : false,
        autoRejoin              : true,
        autoConnect             : true,
        floodProtection         : ircConfig.floodProtection,
        floodProtectionDelay    : ircConfig.floodProtectionDelay,
    });

    userConfig.commandModules.push( _bot );

    _bot.addListener( 'error', message =>
    {
        console.log( 'error: ', chalk.red( message ) );
    });

    // _bot.addListener( 'pm', listenToPm );

    let boundListenToMessages = listenToMessages.bind( context );

    _bot.addListener( 'message', ( to, from, botText ) =>
    {
        botText = boundListenToMessages( to, from, botText );

        if ( botText === undefined )
        {
            console.log( `Undefined botText... That's probably not good.` );
        }
        else if ( botText !== '' && botText !== false )
        {
            if ( typeof botText.then === 'function' )
            {
                botText.then( text =>
                {
                    _bot.say( from, text )
                } );
            }
            else
            {
                _bot.say( from, botText );
            }
        }
    } );


    _bot.pm = _bot.say;

    if ( userConfig.verbose === true )
    {
        _bot.addListener( 'raw', displayDebugInfo );
    }


    return _bot;
}
