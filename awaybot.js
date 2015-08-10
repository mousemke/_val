
var version = '0.1.2';

// Loads the configuration and sets variables
var channel, _bot,
    userConfig  = require( './config/_val.config.js' ),
    channels    = userConfig.channels,
    irc         = require( 'irc' );



/**
 * init
 *
 * sets listeners and master list up
 *
 * @return {void}
 */
function init()
{
    _bot = new irc.Client( userConfig.server, userConfig.botName, {
        channels    : userConfig.channels,
        password    : userConfig.serverPassword,
        showErrors  : false,
        autoRejoin  : true,
        autoConnect : true
    });

    _bot.addListener( 'error', function( message )
    {
        console.log( 'error: ', message );
    });

    _bot.addListener( 'pm', listenToPm );

    for ( var i = 0, lenI = channels.length; i < lenI; i++ )
    {
        channel = userConfig.channels[ i ];
        _bot.addListener( 'message' + channel, listenToMessages.bind( this, channels[ i ] ) );
    }

}


/**
 * listen to messages
 *
 * .... what do you think?
 *
 * @param  {str}            from                originating channel
 * @param  {str}            to                  user
 * @param  {str}            text                full message text
 *
 * @return {void}
 */
function listenToMessages( from, to, text )
{
    if ( text[ 0 ] === userConfig.trigger && text !== userConfig.trigger )
    {
        console.log( '<' + from + '> <' + to + '> :' + text );
        var _message = Math.random() > 0.49 ? userConfig.botName + ' is away eating fishsticks.' :
                        'Your ' + userConfig.botName + ' is getting a firmware ' +
                        'upgrade, please do not press the power button or unplug your computer.';
        _bot.say ( from, _message );
    }
}


/**
 * listen to private messages
 *
 * .... what do you think?
 *
 * @param  {str}            from                originating user
 * @param  {str}            text                full message text
 *
 * @return {void}
 */
function listenToPm( from, text )
{
    console.log( '<pm from ' + from + '> :' + text );
    _bot.say ( from, userConfig.botName + '\'s not here, man...' );
}




init();
