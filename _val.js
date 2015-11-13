
    /**
     * load node modules
     */
var userConfig      = require( './config/_val.config.js' );
    userConfig.req  = {};

var http            = userConfig.req.http   = require( 'http' ),
    https           = userConfig.req.https  = require( 'https' ),
    irc             = userConfig.req.irc    = require( 'irc' ),
    fs              = userConfig.req.fs     = require( 'fs' );
    chalk           = userConfig.req.chalk   = require( 'chalk' );


// Loads the configuration and sets variables
var channel, _bot, words, lastSeenList, _modules = {};
var seenJsonUrl         = 'json/seen.json';
var lastSeenList        = JSON.parse( fs.readFileSync( seenJsonUrl ) ),
    modules             = require( './config/_val.modules.js' ),
    guys                = require( './lists/guys.js' );
    trollBlacklist      = require( './lists/trollBlacklist.js' );
    userConfig.version  = '0.2.2';

var channels            = [];

var debugChalkBox = {
    'PING' : 'blue',
    'MODE' : 'magenta',
    'rpl_channelmodeis' : 'cyan',
    'rpl_myinfo' : 'cyan',
    'rpl_creationtime' : 'cyan',
    'rpl_namreply' : 'cyan',
    'rpl_endofnames' : 'cyan',
    'rpl_topic' : 'gray',
    'JOIN' : 'green',
    'KILL' : 'green',
    'NOTICE' : 'yellow'
};


/**
 * this function is run with the test command.  it exists purely for feature
 * testing.  otherwise it does nothing
 *
 * @param  {str}            from                originating channel
 * @param  {str}            to                  originating user
 * @param  {str}            text                full message text
 *
 * @return _Bool_           false
 */
function testFunction( from, to, text )
{
    console.log( 'nothing here now' );

    return false;
}


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
function apiGet( options, _cb, secure, from, to )
{
    secure = ( secure === false ) ? false : true;

    var _error = function( say )
    {
        if ( say )
        {
            _bot.say( from, 'sorry, ' + to + ' bad query or url. (depends on what you were trying to do)' );
        }
        else
        {
            console.log( options + ' appears to be down' );
        }
    };

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
                _error( from && to );
            }
        } );
    };

    if ( secure )
    {
        https.get( options, callback ).on( 'error', function( e )
        {
            _error( _bot );
        } );
    }
    else
    {
        http.get( options, callback ).on( 'error', function( e )
        {
            _error( _bot );
        } );
    }
}


/**
 * assembles the _val modules.  like Voltron but node
 *
 * @return _Void_
 */
function buildClient()
{
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
        }
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
function checkSeen( from, to, text, talk )
{
    text = text.split( ' ' ).slice( 1 );
    var user = lastSeenList[ text ];

    if ( user )
    {
        var dateObj     = new Date( user.time );
        var minutes     = dateObj.getMinutes() + '';
        minutes = minutes.length === 1 ? '0' + minutes : minutes;
        var dateString  = userConfig.weekdays[ dateObj.getDay() ] + ' ';
        dateString      += userConfig.months[ dateObj.getMonth() ] + ' ';
        dateString      += dateObj.getDate() + ' at ' + dateObj.getHours() + ':' + minutes;

        return to + ': last time I saw ' + text + ' was in ' + user.place + ' on ' + dateString;
    }
    else
    {
        return 'sorry, ' + to + '. I\'ve never met that user';
    }
}


/**
 * ## displayDebugInfo
 *
 * formats and displays debug information
 *
 * @return _Void_
 */
function displayDebugInfo( e )
{
    var command = e.command;

    if ( command !== 'PRIVMSG' )
    {
        var _color  = debugChalkBox[ command ];
        var text    = '     * ' + command + ' : ';

        e.args.forEach( function( arg ){ text += arg + ' '; } );

        if ( _color )
        {
            if ( command === 'PING' )
            {
                var now    = Date.now();
                var minUp  = Math.round( ( ( now - up ) / 1000 / 60 ) * 100 ) / 100;

                console.log( chalk[ _color ]( text ), ( now - lastPing ) + 'ms', chalk.grey( '(' + minUp + 'min up)' ) );
                lastPing = now;

                if ( connectionTimer )
                {
                    clearTimeout( connectionTimer );
                }
                connectionTimer = setTimeout( reConnection, userConfig.reconnectionTimeout );
            }
            else
            {
                console.log( chalk[ _color ]( text ) );
            }
        }
        else
        {
            console.log( e );
        }
    }
};

var connectionTimer = null;
var up              = Date.now();
var lastPing        = Date.now();

function reConnection()
{
    _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
    {
        console.log( 'connection broken.  reconnecting...' );
        start();
    });
}


/**
 * ## generateChannelList
 *
 * generates a channel list based on settings and environment.
 *
 * @return _Void_
 */
function generateChannelList()
{
    /**
     * adds private channels from userConfig.channelsPrivateJoin to the list of
     * channels to join.  These channels are exempt from "seen"
     */
    function addPrivateChannels()
    {
        var _p, _private    = userConfig.channelsPrivateJoin;
        var _privateLength  = _private.length;

        if ( _privateLength )
        {
            for ( var i = 0; i < _privateLength; i++ )
            {
                _p = _private[ i ];
                if ( channels.indexOf( _p ) === -1 )
                {
                    channels.push( _p );
                }
            }
        }
    }

    /**
     * assembles the channel list and starts the client
     *
     * @return _Void_
     */
    function finishChannels()
    {
        userConfig.publicChannels = [].concat( channels );

        if ( modules.Slack.enabled )
        {
            addPrivateChannels();
        }

        removeBlacklistChannels();
        userConfig.channels = channels;

        iniClient();
    }


    /**
     * if any channels are blacklisted from entering from userConfig.channelsPublicIgnore,
     * this removes them from the channels array
     */
    function removeBlacklistChannels()
    {
        var _b, _bIndex, _black = userConfig.channelsPublicIgnore;
        var _blackLength        = _black.length;
        if ( _blackLength )
        {
            for ( var i = 0; i < _blackLength; i++ )
            {
                _b = _black[ i ];
                _bIndex = channels.indexOf( _b );

                if ( _bIndex !== -1 )
                {
                    channels.splice( _bIndex, 1 );
                }
            }
        }
    }


    if ( modules.Slack.enabled && userConfig.autojoin )
    {
        var _url    = 'https://sociomantic.slack.com/api/channels.list?token=' + userConfig.slackAPIKey;

        apiGet( _url, function( res )
        {
            var _channels = res.channels;

            for ( var _c in _channels )
            {
                _c = _channels[ _c ].name;
                _c = _c[0] !== '#' ? '#' + _c : _c;

                channels.push( _c );
            }

            finishChannels();
        }, true );
    }
    else if ( userConfig.channels )
    {
        channels = userConfig.channels;
        finishChannels();
    }
    else
    {
        console.log( 'no channels found' );
    }
}


/**
 * init
 *
 * sets listeners and module list up
 *
 * @return {void}
 */
function iniClient()
{
    _bot = new irc.Client( userConfig.server, userConfig.botName, {
        channels                : channels,
        password                : userConfig.serverPassword,
        showErrors              : false,
        autoRejoin              : true,
        autoConnect             : true,
        floodProtection         : userConfig.floodProtection,
        floodProtectionDelay    : userConfig.floodProtectionDelay,
    });

    _bot.addListener( 'error', function( message )
    {
        console.log( 'error: ', chalk.red( message ) );
    });

    _bot.addListener( 'pm', listenToPm );

    _bot.addListener( 'message', listenToMessages.bind( this ) );

    if ( userConfig.verbose === true )
    {
        _bot.addListener( 'raw', displayDebugInfo );
    }

    _bot.active = {};

    for ( var module in _modules.constructors )
    {
        _modules[ module ]   = new _modules.constructors[ module ]( _bot, _modules, userConfig );

        if ( modules[ module ].ini )
        {
            _modules[ module ].ini();
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
function listenToMessages( to, from, text )
{
    if ( userConfig.verbose === true )
    {
        console.log( chalk.green( from ), chalk.red( to ), text );
    }

    text = trimUsernames( text );

    watchActive( from, to );
    watchSeen( from, to );

    text = trollOn( text );

    if ( userConfig.bots.indexOf( to ) === -1 )
    {
        var botText = '';

        if ( text === '_val' || text === '_val?' )
        {
            botText = 'yes?';
        }
        else if ( text === '_val!' )
        {
            botText = 'what!?';
        }

        var triggers = guys.triggers;

        for ( var i = 0, lenI = triggers.length; i < lenI; i++ )
        {
            if ( text.toLowerCase().indexOf( guys.triggers[ i ] ) !== -1 )
            {
                botText = replaceGuys( to, text );
                break;
            }
        }

        if ( text[ 0 ] === userConfig.trigger && text !== userConfig.trigger && botText === '' )
        {
            if ( text === userConfig.trigger + 'moon?' )
            {
                botText = 'The Moon has a long association with insanity and irrationality';
            }
            else if ( text === userConfig.trigger + 'isup' )
            {
                botText = 'Yes, but c\'mon!  At least use a full sentence!';
            }

            for ( var module in _modules )
            {
                if ( botText !== '' )
                {
                    break;
                }

                if ( module !== 'constructors' )
                {
                    botText = _modules[ module ].responses( from, to, text, botText );
                }
            }
        }

        if ( botText !== '' && botText !== false )
        {
            _bot.say( from, botText );
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
 * if there is no whisper command, the text is passed to normal messages
 *
 * @param  {str}            from                originating user
 * @param  {str}            text                full message text
 *
 * @return {void}
 */
function listenToPm( from, text )
{
    var textSplit   = text.split( ' ' );
    var command     = textSplit[ 0 ];

    if ( command[0] === userConfig.trigger )
    {
        command = command.slice( 1 );
    }

    if ( userConfig.admins.indexOf( from ) !== -1 )
    {
        switch ( command )
        {
            case 'die':
                _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
                {
                    console.log( from + ' killed me' );
                });
                break;
            default:
                listenToMessages( from, from, text );
        }
    }
    else
    {
        switch ( command )
        {
            case 'help':
                botText = userConfig.helpText();
                _bot.say ( from, botText );
                botText = '';
                break;
            default:
                listenToMessages( from, from, text );
        }
    }
}


/**
 * responds to 'guys' (and other trigger words) with alternative suggestions
 *
 * @param  {String} to              user
 * @param  {String} text            original text
 *
 * @return {String} suggestion
 */
function replaceGuys( to, text )
{
    var _alternative    = guys.alternatives[ Math.floor( Math.random() * guys.alternatives.length ) ];
    var _speech         = guys.speech[ Math.floor( Math.random() * guys.speech.length ) ];

    return to + ', ' + _speech + _alternative + '...';
}


/**
 * base reponse functions of val
 *
 * @param  {String}         from                channel of origin
 * @param  {String}         to                  player of origin
 * @param  {String}         text                full text
 * @param  {String}         botText             response text
 *
 * @return {String}                             response text
 */
function responses( from, to, text, botText )
{
    var command = text.slice( 1 ).split( ' ' )[ 0 ];

    switch ( command )
    {
        case 'active':
            checkActive( from, to, text );
            break;
        case 'seen':
            botText = checkSeen( from, to, text );
            break;
        case 'test':
            botText = testFunction( from, to, text );
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
 * start the thing!
 *
 * @return _Void_
 */
function start()
{
    buildClient();
    generateChannelList();
}


/**
 * trimUsernames
 *
 * removes the set usernamePrefix from the front of usernames
 *
 * @param  {String} text            original text
 *
 * @return {String}
 */
function trimUsernames( text )
{
    if ( userConfig.usernamePrefix && userConfig.usernamePrefix.length > 0 )
    {
        text = text.split( ' ' );

        for ( var i = 0, lenI = text.length; i < lenI; i++ )
        {
            if ( userConfig.usernamePrefix.indexOf( text[ i ][0] ) !== -1 )
            {
                text[ i ] = text[ i ].slice( 1 );
            }
        }

        return text.join( ' ' );
    }

    return text;
}


/**
 * ## trollOn
 *
 * responds if the word "troll" or "trøll" is in the text.  ignores blacklist items
 *
 * @param {String} text original text string
 *
 * @return {String} original or modified text
 */
function trollOn( text )
{
    var textSplit = text.split( ' ' );

    for ( var i = 0, lenI = textSplit.length; i < lenI; i++ )
    {
        if ( trollBlacklist.indexOf( textSplit[ i ] ) !== -1 )
        {
            return text;
        }
    }

    if ( text.toLowerCase().indexOf( 'troll' ) !== -1 )
    {
        text = userConfig.trigger + 'trollfetti';
    }
    else if ( text.toLowerCase().indexOf( 'trøll' ) !== -1 )
    {
        text = userConfig.trigger + 'trøllfetti';
    }

    return text;
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
    if ( userConfig.bots.indexOf( to ) === -1 )
    {
        if ( !_bot.active[ from ] )
        {
            _bot.active[ from ] = {};
        }
        _bot.active[ from ][ to ] = Date.now();
    }
}


/**
 * watch seen
 *
 * records the latest place a user is seen
 *
 * @param  {str}            from                originating channel
 * @param  {str}            to                  originating user
 *
 * @return {void}
 */
function watchSeen( from, to )
{
    if ( userConfig.publicChannels && userConfig.publicChannels.indexOf( from ) !== -1 &&
            userConfig.channelsSeenIgnore.indexOf( from ) === -1 )
    {
        lastSeenList[ to ] = { time: Date.now(), place: from };
    }

    var writeList =  JSON.stringify( lastSeenList );

    fs.writeFile( seenJsonUrl, writeList, function ( err )
    {
        if ( err )
        {
            console.log( 'err: ',  err );
        }
    } );
}

start();

