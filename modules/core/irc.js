
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
            if ( typeof botText.then === 'function' )
            {
                botText.then( function( text )
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


    if ( userConfig.verbose === true )
    {
        _bot.addListener( 'raw', displayDebugInfo );
    }

    /**
     * ## sayNow
     *
     * special function for val saying things without being prompted
     *
     * @param {String} from detsination
     * @param {String} text message text
     * @param {Boolean} pm private message or not (doesnt matter to irc)
     *
     * @return _Void_
     */
    _bot.sayNow = function( from, text, pm )
    {
        _bot.say( from, text );
    };

    return _bot;
}
