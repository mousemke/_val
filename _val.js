
// Loads the configuration and sets variables
var channel, _bot, words, lastSeenList, _modules = {},
    userConfig          = require( './config/_val.config.js' ),
    modules             = require( './config/_val.modules.js' );
    userConfig.version  = '0.2.0';
    userConfig.req      = {};

var channels            = [];

    /**
     * load node modules
     */
var http    = userConfig.req.http   = require( 'http' ),
    https   = userConfig.req.https  = require( 'https' ),
    irc     = userConfig.req.irc    = require( 'irc' ),
    fs      = userConfig.req.fs     = require( 'fs' );


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
function apiGet( _url, _cb, secure, from, to )
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
                if ( from && to )
                {
                    _bot.say( from, 'sorry, ' + to + ' bad query or url. (depends on what you were trying to do)' );
                }
                else
                {
                    console.log( _url + ' appears to be down' );
                }
            }
        } );

    };

    if ( secure )
    {
        https.get( _url, callback ).on( 'error', function( e )
        {
            if ( _bot )
            {
                _bot.say( from, 'sorry, ' + to + ' bad query or url. (depends on what you were trying to do)' );
            }
            else
            {
                console.log( 'Got error: ', e );
            }
        });
    }
    else
    {
        http.get( _url, callback ).on( 'error', function( e )
        {
            if ( _bot )
            {
                _bot.say( from, 'sorry, ' + to + ' bad query or url. (depends on what you were trying to do)' );
            }
            else
            {
                console.log( 'Got error: ', e );
            }
        });
    }
}


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

            // newModule               = module.toLowerCase();

            _modules[ module ]   = new _modules.constructors[ module ]( _bot, _modules, userConfig );
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
        var dateObj = new Date( user.time );
        var minutes = dateObj.getMinutes();
        var dateString = userConfig.weekdays[ dateObj.getDay() ] + ' ';
        dateString    += userConfig.months[ dateObj.getMonth() ] + ' ';
        dateString    += dateObj.getDate() + ' at ' + dateObj.getHours() + ':' + minutes;

        return to + ': last time I saw ' + text + ' was in ' + user.place + ' on ' + dateString;
    }
    else
    {
        return 'sorry, ' + to + '. I\'ve never met that user';
    }
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

    function removeBlacklistChannels()
    {
        var _b, _bIndex, _black = userConfig.channelPublicIgnore;
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

    if ( userConfig.autojoin )
    {
        if ( modules.Slack.enabled )
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
        else if ( modules.Twitch.enabled )
        {
            // just one i think
            channels = userConfig.channels;
            finishChannels();
        }
        else // irc
        {
            // theoretically /list works
            channels = userConfig.channels;
            finishChannels();
        }
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
 * init
 *
 * sets listeners and master list up
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
        // encoding                : 'UTF-8'
    });

    _bot.addListener( 'error', function( message )
    {
        console.log( 'error: ', message );
    });

    _bot.addListener( 'pm', listenToPm );

    for ( var i = 0, lenI = channels.length; i < lenI; i++ )
    {
        channel = channels[ i ];
        _bot.addListener( 'message' + channel, listenToMessages.bind( this, channels[ i ] ) );
    }

    _bot.active = {};

    for ( var module in _modules )
    {
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
function listenToMessages( from, to, text )
{
    text = trimUsernames( text );

    watchActive( from, to );
    watchSeen( from, to );

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
            botText = 'yes?';
        }
        else if ( text === '_val!' )
        {
            botText = 'yes?';
        }

        var triggers = guys.triggers;

        for ( var i = 0, lenI = triggers.length; i < lenI; i++ )
        {
            if ( text.indexOf( guys.triggers[ i ] ) !== -1 )
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
            console.log( '<' + from + '> <' + to + '> :' + text );

            if ( botText !== undefined )
            {
                console.log( '<' + from + '> <' + ( userConfig.botName ) + '> :' + botText );
            }
            _bot.say ( from, botText );
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

        _bot.say ( from, botText );
        botText = '';
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
    var url = 'json/seen.json';

    lastSeenList = lastSeenList || JSON.parse( ( fs.readFileSync( url ) ) ) || {};

    if ( userConfig.publicChannels && userConfig.publicChannels.indexOf( from ) !== -1 &&
            userConfig.channelsSeenIgnore.indexOf( from ) === -1 )
    {
        lastSeenList[ to ] = { time: Date.now(), place: from };
    }

    if ( lastSeenList )
    {
        fs.writeFile( url, JSON.stringify( lastSeenList ), function ( err )
        {
            if ( err )
            {
                console.log( err );
            }
        } );
    }
}


var guys = {

    triggers : [
        'guys',
        'dudes'
    ],

    alternatives : [
        'team',
        'squad',
        'gang',
        'pals',
        'buds',
        'posse',
        'phalanx',
        'crew',
        'crüe',
        'nerds',
        'friends',
        'fellow-humans',
        'folks',
        'people',
        'peeps',
        'friends',
        'chums',
        'everyone',
        'you lot',
        'youse',
        'y\'all',
        'peers',
        'comrades'
    ],

    speech : [
        'I think you meant ',
        'Perhaps you meant ',
        'Surely you meant ',
        'You probably meant '
    ]
};

start();

