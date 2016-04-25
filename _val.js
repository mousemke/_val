

var _Val = function( commandModule, userConfig )
{
        userConfig.req              = {};
        userConfig.commandModules   = [];

    var http            = userConfig.req.http   = require( 'http' ),
        https           = userConfig.req.https  = require( 'https' ),
        fs              = userConfig.req.fs     = require( 'fs' ),
        chalk           = userConfig.req.chalk  = require( 'chalk' );


    // Loads the configuration and sets variables
    var channel, _bot, words, lastSeenList, _modules = {};
    var seenJsonUrl         = 'json/seen.json';
    var lastSeenList        = JSON.parse( fs.readFileSync( seenJsonUrl ) ),
        modules             = require( './config/_val.modules.js' ),
        guys                = require( './lists/guys.js' );
        trollBlacklist      = require( './lists/trollBlacklist.js' );

    var channels            = [];

    var debugChalkBox = {
        'PING'              : 'blue',
        'MODE'              : 'magenta',
        'rpl_channelmodeis' : 'cyan',
        'rpl_myinfo'        : 'cyan',
        'rpl_creationtime'  : 'cyan',
        'rpl_namreply'      : 'cyan',
        'rpl_endofnames'    : 'cyan',
        'rpl_topic'         : 'gray',
        'JOIN'              : 'green',
        'KILL'              : 'green',
        'NOTICE'            : 'yellow',
        'TOPIC'             : 'yellow'
    };


    /**
     * ## buildCore
     *
     * this will develop into a dynamic core loader.  for noe, it is what it is
     *
     * @return {[type]} [description]
     */
    function buildCore()
    {
        commandModule = userConfig.command[ commandModule ];
        var commander = require( commandModule.url );
        _bot = commander( userConfig, _bot, channels, listenToMessages, displayDebugInfo , this );
    }


    /**
     * ## testFunction
     *
     * this function is run with the test command.  it exists purely for feature
     * testing.  otherwise it does nothing
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     *
     * @return _Boolean_           false
     */
    function testFunction( from, to, text )
    {
        console.log( 'nothing here now' );

        return false;
    }


    /**
     * ## apiGet
     *
     * gets and parses JSON from api sources
     *
     * @param {String} _url target url
     * @param {Function} _cb callback
     * @param {Boolean} secure https?
     *
     * @return _Void_
     */
    function apiGet( options, _cb, secure, from, to )
    {
        secure = ( secure === false ) ? false : true;

        var _error = function( say )
        {
            console.log( say );
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
                    _error( e );
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
     * ## buildClient
     *
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
     * ## checkActive
     *
     * returns a list of users that have posted within the defined amount of time
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     * @param {Boolean} talk true to say, otherwise active only returns
     *
     * @return _Array_ active users
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
     * ## checkSeen
     *
     * returns the last time and room a user was seene
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     *
     * @return _Array_ active users
     */
    function checkSeen( from, to, text )
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
                    var minUp  = ( Math.round( ( ( now - up ) / 1000 / 60 ) * 100 ) / 100 ) + '';

                    if ( minUp.indexOf( '.' ) === -1 )
                    {
                        minUp += '.00';
                    }
                    else if ( minUp.split( '.' )[1].length !== 2 )
                    {
                        minUp += '0';
                    }

                    console.log( chalk[ _color ]( text ), ( now - lastPing ) + 'ms', chalk.grey( '(' + minUp + 'min up)' ), new Date().toLocaleString() );
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

            ini();
        }


        /**
         * if any channels are blacklisted from entering from userConfig.channelsPublicIgnore,
         * this removes them from the channels array
         */
        function removeBlacklistChannels()
        {
            var _b, _bIndex, _black = userConfig.channelsPublicIgnore || [];
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
            var _url    = 'https://' + userConfig.slackChannel + '.slack.com/api/channels.list?token=' + userConfig.slackAPIKey;

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
     * ## ini
     *
     * sets listeners and module list up
     *
     * @return _Void_
     */
    function ini()
    {
        buildCore();

        _bot.active = {};

        for ( var module in _modules.constructors )
        {
            _modules[ module ]   = new _modules.constructors[ module ]( _bot, _modules, userConfig );

            if ( modules[ module ].ini )
            {
                _modules[ module ].ini();
            }
        }

        console.log( '_bot built' );
    }


    /**
     * ## listenToMessages
     *
     * .... what do you think?
     *
     * @param {String} from originating channel
     * @param {String} to user
     * @param {String} text full message text
     *
     * @return _Void_
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
                    botText = 'In 500 million years, the moon will be 14,600 miles farther away than it is right now. When it is that far, total eclipses will not take place';
                }
                else if ( text === userConfig.trigger + 'isup' )
                {
                    botText = 'Yes, but c\'mon!  At least use a full sentence!';
                }

                if ( text[0] === userConfig.trigger )
                {
                    text = text.slice( 1 );
                }

                var command = text.split( ' ' )[ 0 ];

                for ( var module in _modules )
                {
                    if ( botText !== '' )
                    {
                        break;
                    }

                    if ( module !== 'constructors' )
                    {
                        botText = _modules[ module ].responses( from, to, text, botText, command );
                    }
                }
            }

            return botText;
        }
        else if ( userConfig.bots.indexOf( to ) !== -1 &&
            ( text[ 0 ] ===  userConfig.trigger && text !==  userConfig.trigger ) )
        {
            // automated response to automated people
        }
    }


    /**
     * ## listenToPm
     *
     * .... what do you think?
     * if there is no specific whisper command, the text is passed to normal messages
     *
     * @param {String} from originating user
     * @param {String} text full message text
     *
     * @return _Void_
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
                    listenToMessages( from, from, text, command );
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
                    listenToMessages( from, from, text, command );
            }
        }
    }


    /**
     * ## reConnection
     *
     * disconnects and reconnects _val
     *
     * @return _Void_
     */
    function reConnection()
    {
        _bot.disconnect( 'Fine...  I was on my way out anyways.', function( e )
        {
            console.log( 'disconnected? ', e );
        } );

        ini();
        console.log( 're-initializing client...' );
    }


    /**
     * ## replaceGuys
     *
     * responds to 'guys' (and other trigger words) with alternative suggestions
     *
     * @param {String} to user
     * @param {String} text original text
     *
     * @return _String_ suggestion
     */
    function replaceGuys( to, text )
    {
        var _alternative    = guys.alternatives[ Math.floor( Math.random() * guys.alternatives.length ) ];
        var _speech         = guys.speech[ Math.floor( Math.random() * guys.speech.length ) ];

        return to + ', ' + _speech + _alternative + '...';
    }


    /**
     * ## responses
     *
     * base reponse functions of val
     *
     * @param {String} from channel of origin
     * @param {String} to player of origin
     * @param {String} text full text
     * @param {String} botText response text
     *
     * @return _String_ response text
     */
    function responses( from, to, text, botText, command )
    {
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
     * ## start
     *
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
     * ## trimUsernames
     *
     * removes the set usernamePrefix from the front of usernames
     *
     * @param {String} text original text
     *
     * @return _String_
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
     * @return _String_ original or modified text
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
     * ## userData
     *
     * gets userdata from the nickserv authentication bot
     *
     * @param {String} to user
     * @param {String} from originating channel
     * @param {Function} _cb callback
     * @param {String} origText original message text
     *
     * @return _Void_
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
     * ## watchActive
     *
     * sets the latest active time for a user in a channel
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     *
     * @return _Void_
     */
    function watchActive( from, to )
    {
        var ignoreTheBots = userConfig.bots || [];

        if ( ignoreTheBots.indexOf( to ) === -1 )
        {
            if ( !_bot.active[ from ] )
            {
                _bot.active[ from ] = {};
            }
            _bot.active[ from ][ to ] = Date.now();
        }
    }


    /**
     * ## watchSeen
     *
     * records the latest place a user is seen
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     *
     * @return _Void_
     */
    function watchSeen( from, to )
    {
        if ( userConfig.publicChannels &&
                userConfig.publicChannels.indexOf( from )       !== -1 &&
                userConfig.channelsSeenIgnore.indexOf( from )   === -1 )
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

    return this;
};


function _val( commander )
{
    return new _Val( commander, userConfig );
}

var userConfig          = require( './config/_val.config.js' );
var packageJSON         = require( './package.json' );
    userConfig.version  = packageJSON.version;

module.exports = [ _val( 'irc' ), _val( 'telegram' ) ];

