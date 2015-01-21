
var version = '0.1.3a';

// Loads the configuration and sets variables
var channel, _bot, words, _modules = {},
    userConfig      = require( './config/_val.config.js' );

    userConfig.req  = {};

var channels        = userConfig.channels,

    /**
     * load node modules
     */
    http    = userConfig.req.http   = require( 'http' ),
    https   = userConfig.req.https  = require( 'https' ),
    irc     = userConfig.req.irc    = require( 'irc' ),
    fs      = userConfig.req.fs     = require( 'fs' );

/**
 * API get
 *
 * gets and parses JSON from api sources
 *
 * @param  {str}                    _url                target url
 * @param  {func}                   _cb                 callback
 * @param  {bool}                   secure              https?
 *
 * @return {void}
 */
function apiGet( _url, _cb, secure )
{
    secure = ( secure === false ) ? false : true;

    var callback = function( res )
    {
        var body = '';

        res.on( 'data', function( chunk )
        {
            body += chunk;
        });

        res.on( 'end', function()
        {
            var data;
            try
            {
                data = JSON.parse( body );
                _cb( data );
            }
            catch( e )
            {
                console.log( _url + ' appears to be down' );
            }
        });

    };

    if ( secure )
    {
        https.get( _url, callback ).on( 'error', function( e )
        {
            console.log( 'Got error: ', e );
        });
    }
    else
    {
        http.get( _url, callback ).on( 'error', function( e )
        {
            console.log( 'Got error: ', e );
        });
    }
}


/**
 * Check active
 *
 * returns a list of users that have posted within the defined amount of time
 *
 * @param  {str}            from                originating channel
 * @param  {str}            to                  originating user
 * @param  {str}            text                full message text
 * @param  {bool}           talk                true to say, otherwise
 *                                                      active only returns
 *
 * @return {arr}                                        active users
 */
function checkActive( from, to, text, talk )
{
    var name, now = Date.now(), i = 0,
        activeUsers = [];

    if ( ! _bot.active[ from ] )
    {
        _bot.active[ from ] = {};
    }

    var activeChannel = _bot.active[ from ];

    if ( ! activeChannel[ to ] && to !== userConfig.botName &&
            userConfig.bots.indexOf( to ) === -1 )
    {
        activeChannel[ to ] = now;
        now++;
    }

    for ( name in activeChannel )
    {
        if ( now - userConfig.activeTime < activeChannel[ name ] )
        {
            i++;
            activeUsers.push( name );
        }
        else
        {
            delete activeChannel[ name ];
        }
    }

    if ( talk !== false )
    {
        botText = 'I see ' + i + ' active user';

        if ( i > 1 || i === 0 )
        {
            botText += 's';
        }

        botText += ' in ' + from;

        _bot.say( from, botText );
    }

    return activeUsers;
}


/**
 * init
 *
 * sets listeners and master list up
 *
 * @return {void}
 */
function ini()
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

    _bot.active = {};

    /*
     * adds core components to an obj to be passed modules
     */
    _modules.core = {

         checkActive    : checkActive,

         userData       : userData,

         apiGet         : apiGet,

         responses      : responses
    };

    _modules.constructors = {};

    /**
     * load _val modules
     */
    modules     = require( './config/_val.modules.js' );

    for ( var module in modules )
    {
        var _module = modules[ module ];

        if ( _module.enabled )
        {
            _modules.constructors[ module ] = require( _module.url );

            if ( _module.options )
            {
                for ( var option in _module.options )
                {
                    userConfig[ option ] = _module.options[ option ];
                }
            }

            newModule       = module.toLowerCase();

            _modules[ newModule ] = new _modules.constructors[ module ]( _bot, _modules, userConfig );

            if ( modules[ module ].ini )
            {
                _modules[ newModule ].ini();
            }
        }
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
    watchActive( from, to );

    if ( text.toLowerCase().indexOf( 'troll' ) !== -1 )
    {
        text = userConfig.trigger + 'trollfetti';
    }
    else if ( text.toLowerCase().indexOf( 'trøll' ) !== -1 )
    {
        text = userConfig.trigger + 'trøllfetti';
    }

    if ( userConfig.bots.indexOf( to ) === -1 )
    {
        var botText = '';

        if ( text === '_val' || text === '_val?' )
        {
            _bot.say( from, 'yes?' );
        }
        else if ( text === userConfig.trigger + 'moon?' )
        {
            _bot.say( from, 'An astronaut miner extracting the precious moon gas that promises to reverse the Earth\'s energy crisis nears the end of his three-year contract, and makes an ominous discovery in this psychological sci-fi film starring Sam Rockwell and Kevin Spacey.' );
        }
        else if ( text[ 0 ] === userConfig.trigger && text !== userConfig.trigger )
        {
            for ( var module in _modules )
            {
                if ( module !== 'constructors' )
                {
                    botText = _modules[ module ].responses( from, to, text, botText );
                }

                if ( botText !== '' )
                {
                    break;
                }
            }

            if ( botText !== '' )
            {
                console.log( '<' + from + '> <' + to + '> :' + text );
                console.log( '<' + from + '> <' + ( userConfig.botName ) + '> :' + botText );
                _bot.say ( from, botText );
            }
        }
    }
    else if ( userConfig.bots.indexOf( to ) !== -1 &&
        ( text[ 0 ] ===  userConfig.trigger && text !==  userConfig.trigger ) )
    {
        // automated response to automated people
        // _bot.say( from, 'nice try....' );
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
    console.log( '<' + from + '> :' + text );

    // var textSplit = text.split( ' ' );
    // if ( textSplit[ 0 ] === 'die' && userConfig.admins.indexOf( from ) !== -1 )
    // {
    //     _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
    //     {
    //         console.log( from + ' killed me' );
    //     });
    // }
    // else if ( textSplit[ 0 ] === 'restart' && userConfig.admins.indexOf( from ) !== -1 )
    // {
    //     _bot.say ( userConfig.unscramble, 'I will restart after the next word is skipped or solved' );
    //     _bot.say ( userConfig.anagramm, 'Nach diesem Wort werde ich neu gestartet' );
    // }
    // else if ( textSplit[ 0 ] === 'help' )
    // {
    //     botText = userConfig.helpText();

    //     _bot.say ( from, botText );
    //     botText = '';
    // }
    // else if ( _modules.doge && textSplit[ 0 ] === 'doge' )
    // {
    //     _modules.doge.doge( from, text, false );
    // }
    // else if ( _modules.doge && textSplit[ 0 ] === 'market' )
    // {
    //     _modules.doge.doge( from, text, true );
    // }
    // else if ( _modules.doge && textSplit[ 0 ] === 'withdraw' )
    // {
    //     _modules.doge.withdraw( from, from, text );
    // }
    // else if ( _modules.doge && textSplit[ 0 ] === 'balance' )
    // {
    //     _modules.doge.balance( from, from, text );
    // }
    // else if ( _modules.doge && textSplit[ 0 ] === 'deposit' )
    // {
    //     _modules.doge.deposit( from, from, text );
    // }
    // else
    // {
    //     _modules.words.responses( from, from, text, '' );
    // }
}


function responses( from, to, text, botText )
{
    var command = text.slice( 1 ).split( ' ' )[ 0 ];

    switch ( command )
    {
        case 'active':
            checkActive( from, to, text );
            break;
        case 'version':
        case userConfig.trigger + 'v':
            botText = 'Well, ' + to + ', thanks for asking!  I\'m currently running version ' + version;
            break;
        case 'help':
            if ( userConfig.enableHelp )
            {
                if ( userConfig.enablePM )
                {
                    _bot.say ( to, userConfig.helpText() );
                }
                else
                {
                    _bot.say ( from, to + ': ' + userConfig.helpText() );
                }
                botText = '';
            }
            break;
        default:
            botText = '';
    }

    return botText;
}


/**
 * userdata
 *
 * gets userdata from the nickserv authentication bot
 *
 * @param  {str}            to                  user
 * @param  {str}            from                originating channel
 * @param  {func}           _cb                 callback
 * @param  {str}            origText            original message text
 *
 * @return {void}
 */
function userData( to, from, _cb, origText )
{
    if ( userConfig.autoAuth )
    {
        var textSplit = origText.slice( 1 ).split( ' ' );

        _cb( to, 'true', textSplit, origText );
    }
    else
    {
        var response = function( _from, text )
        {
            _bot.removeListener( 'pm', response );

            var textSplit       = text.split( ' ' );
            var apiReturn       = textSplit[ 0 ];
            var returnMessage   = textSplit[ 1 ];
            var user            = textSplit[ 2 ];
            var result          = textSplit[ 3 ];

            if ( apiReturn === userConfig.nickservAPI &&
                returnMessage === 'identified' && user === to && result === 'true' )
            {
                _cb( to, result, textSplit, origText );
            }
            else if ( apiReturn === userConfig.nickservAPI &&
                returnMessage === 'identified' && user === to && result === 'false' )
            {
                _bot.say( to, 'You are not identified. (/msg NickServ help)' );
            }
            else if ( apiReturn === userConfig.NickservAPI && returnMessage === 'notRegistered' && user === to )
            {
                _bot.say( to, 'You are not a registered user. (/msg NickServ help)' );
            }
        };

        _bot.addListener( 'pm', response );

        _bot.say( userConfig.nickservBot, userConfig.nickservAPI + ' identify ' + to );
    }
}


/**
 * watch active
 *
 * sets the latest active time for a user in a channel
 *
 * @param  {str}            from                originating channel
 * @param  {str}            to                  originating user
 *
 * @return {void}
 */
function watchActive( from, to )
{
    if ( !_bot.active[ from ] )
    {
        _bot.active[ from ] = {};
    }
    _bot.active[ from ][ to ] = Date.now();
}


ini();
