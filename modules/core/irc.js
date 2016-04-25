
/**
 * ## val irc loader
 *
 * @return _Object_ irc chatbot
 */
module.exports = function ircBot( userConfig, _bot, channels, listenToMessages, displayDebugInfo, context )
{
    var Irc = require( 'irc' );

    var ircConfig = userConfig.command.irc;

    _bot = new Irc.Client( ircConfig.server, ircConfig.botName, {
        channels                : channels,
        password                : ircConfig.serverPassword,
        showErrors              : false,
        autoRejoin              : true,
        autoConnect             : true,
        floodProtection         : ircConfig.floodProtection,
        floodProtectionDelay    : ircConfig.floodProtectionDelay,
    });

    userConfig.commandModules.push( _bot );

    _bot.addListener( 'error', function( message )
    {
        console.log( 'error: ', chalk.red( message ) );
    });

    // _bot.addListener( 'pm', listenToPm );

    var boundListenToMessages = listenToMessages.bind( context );

    _bot.addListener( 'message', function( to, from, text )
    {
        var botText = boundListenToMessages( to, from, text );

        if ( botText !== '' && botText !== false )
        {
            _bot.say( from, botText );
        }
    } );

    if ( userConfig.verbose === true )
    {
        _bot.addListener( 'raw', displayDebugInfo );
    }

    return _bot;
}
