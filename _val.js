
var version = '0.1.2';

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
    fs      = userConfig.req.fs     = require( 'fs' ),

    /**
     * Lists
     */
    cars        = require( './lists/cars.js' );


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
 * Dodge
 *
 * by stefan's request
 *
 * @param  {str}                    from                originating channel
 * @param  {str}                    to                  originating user
 * @param  {str}                    text                message text
 *
 * @return {void}
 */
function dodge( from, to, text )
{
    var textSplit = text.split( ' ' );

    if ( textSplit[1] )
    {
        to = textSplit[1];
    }

    var botText = ' hits ' + to + ' with a ';
    var car = cars[ Math.floor( Math.random() * cars.length ) ];

    if ( !car[ 1 ] )
    {
        botText += 'Dodge ' + car[ 0 ];
    }
    else if ( !car[ 2 ] )
    {
        botText += car[ 1 ] + ' Dodge ' + car[ 0 ];
    }
    else
    {
        var spread = car[ 2 ] - car[ 1 ];
        var year = Math.floor( Math.random() * spread ) + car[ 1 ];
        botText += year + ' Dodge ' + car[ 0 ];
    }

    _bot.action( from, botText );
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

    /**
     * load _val modules
     */
    modules     = require( './config/_val.modules.js' );

    for ( var module in modules ) 
    {
        var _module = modules[ module ];

        if ( _module.enabled )
        {
            _modules[ module ] = require( _module.url );    
            
            if ( _module.options )
            {
                for ( var option in _module.options )
                {
                    userConfig[ option ] = _module.options[ option ];
                }
            }

            newModule       = module.toLowerCase();;

            _modules[ newModule ] = new _modules[ module ]( _bot, apiGet, userData, userConfig );

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
            _bot.say( from, 'Moon Knight is a fictional character, a superhero who appears in comic books published by Marvel Comics. The character exists in the Marvel Universe and was created by Doug Moench and Don Perlin. He first appeared in Werewolf by Night #32.' );
        }
        else if ( text[ 0 ] === userConfig.trigger && text !== userConfig.trigger )
        {
            botText = _modules.nico( from, to, text, botText );

            if ( botText === '' )
            {
                botText = _modules.plaintext( from, to, text, botText );
            }

            if ( botText === '' )
            {
                botText = _modules.beats( from, to, text, botText );
            }

            if ( botText === '' )
            {
                botText = _modules.xkcd.responses( from, to, text, botText );
            }

            if ( botText === '' && _modules.doge )
            {
                botText = _modules.doge.responses( from, to, text, botText );
            }

            if ( botText === '' && _modules.words )
            {
                botText = _modules.words.responses( from, to, text, botText );
            }

            if ( botText === '' && _modules.anagramm )
            {
                botText = _modules.anagramm.responses( from, to, text, botText );
            }

            if ( botText === '' && _modules.foursquare )
            {
                botText = _modules.foursquare.responses( from, to, text, botText );
            }

            if ( botText === '' && _modules.pool )
            {
                botText = _modules.pool.responses( from, to, text, botText );
            }

            if ( botText === '' )
            {
                var command = text.slice( 1 ).split( ' ' )[ 0 ];

                switch ( command )
                {
                    case 'dodge':
                        dodge( from, to, text );
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

    var textSplit = text.split( ' ' );
    if ( textSplit[ 0 ] === 'die' && userConfig.admins.indexOf( from ) !== -1 )
    {
        _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
        {
            console.log( from + ' killed me' );
        });
    }
    else if ( textSplit[ 0 ] === 'restart' && userConfig.admins.indexOf( from ) !== -1 )
    {
        _bot.say ( userConfig.unscramble, 'I will restart after the next word is skipped or solved' );
        _bot.say ( userConfig.anagramm, 'Nach diesem Wort werde ich neu gestartet' );
    }
    else if ( textSplit[ 0 ] === 'help' )
    {
        botText = userConfig.helpText();
        if ( textSplit[ 1 ] === '-v' )
        {
            botText += userConfig.helpTextSecondary();
        }
        _bot.say ( from, botText );
        botText = '';
    }
    else if ( doge && textSplit[ 0 ] === 'doge' )
    {
        doge.doge( from, text, false );
    }
    else if ( doge && textSplit[ 0 ] === 'market' )
    {
        doge.doge( from, text, true );
    }
    else if ( doge && textSplit[ 0 ] === 'withdraw' )
    {
        doge.withdraw( from, from, text );
    }
    else if ( doge && textSplit[ 0 ] === 'balance' )
    {
        doge.balance( from, from, text );
    }
    else if ( doge && textSplit[ 0 ] === 'deposit' )
    {
        doge.deposit( from, from, text );
    }
    else
    {
        words.responses( from, from, text, '' );
    }
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


ini();
