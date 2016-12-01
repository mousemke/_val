

var _Val = function( commandModule, userConfig )
{
    commandModule       = userConfig.command[ commandModule ];
    var commandType     = commandModule.botName;

    var req             = userConfig.req;
    var http            = req.http,
        https           = req.https,
        fs              = req.fs,
        chalk           = req.chalk;

    // Loads the configuration and sets variables
    var channel, _bot, _modules = {};

    var channels        = [];

    var debugChalkBox = {
        'PING'              : 'blue',
        'MODE'              : 'magenta',
        'rpl_channelmodeis' : 'cyan',
        'rpl_myinfo'        : 'cyan',
        'rpl_creationtime'  : 'cyan',
        'rpl_namreply'      : 'cyan',
        'rpl_endofnames'    : 'cyan',
        'rpl_topic'         : 'gray',
        'rpl_isupport'      : 'magenta',
        'rpl_welcome'       : 'magenta',
        'rpl_luserclient'   : 'magenta',
        'rpl_motdstart'     : 'bgMagenta',
        'rpl_motd'          : 'bgMagenta',
        'rpl_endofmotd'     : 'bgMagenta',
        'JOIN'              : 'green',
        'KILL'              : 'green',
        'NOTICE'            : 'yellow',
        'TOPIC'             : 'yellow'
    };


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
                _bot.say( from, `sorry, ${to} bad query or url. (depends on what you were trying to do)` );
            }
            else
            {
                console.log( `${options} appears to be down` );
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

    const { trigger } = userConfig;

    /**
     * ## baseResponses
     *
     * val's base responses that both require no modules and are non-optional
     * @type {Object}
     */
    baseResponses = {
        active : {
            module  : 'base',
            f       : checkActive,
            desc    : 'checks how many people are actuve in the channel',
            syntax  : [
                `${trigger}active`
            ]
        }
    };


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

             apiGet         : apiGet
        };

        _modules.constructors = {};
    }


    /**
     * ## buildCore
     *
     * this will develop into a dynamic core loader.  for now, it is what it is
     *
     * @return _Void_
     */
    function buildCore()
    {
        var Commander = require( commandModule.url );
        _bot        = new Commander( userConfig, _bot, channels, listenToMessages, displayDebugInfo , this );
        _bot.name   = commandModule.botName;
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
            var text    = `     * ${command} : `;

            e.args.forEach( function( arg ){ text += `${arg} `; } );

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

                    console.log( chalk[ _color ]( text ), `${now - lastPing}ms`, chalk.grey( `(${minUp}min up)`, new Date().toLocaleString() ) );
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
         * channels to join.
         */
        function addPrivateChannels()
        {
            var _p, _private    = commandModule.channelsPrivateJoin;

            if ( _private )
            {
                var _privateLength  = _private.length;

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

            if ( commandModule.slackTeam )
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


        if ( commandModule.slackTeam && commandModule.autojoin )
        {
            var _url    = `https://${commandModule.slackTeam}.slack.com/api/channels.list?token=${userConfig.slackAPIKey}`;

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

        _bot.active     = {};
        _bot.responses  = baseResponses;
        _bot._modules   = _modules;

        console.log( `${commandType} built` );
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
    function listenToMessages( to, from, text, confObj )
    {
        if ( text )
        {
            if ( userConfig.verbose === true )
            {
                console.log( 'AWAYBOT: ', commandType, chalk.green( from ), chalk.red( to ), text );
            }

            text = trimUsernames( text );


            if ( userConfig.bots.indexOf( to ) === -1 )
            {

                if ( text[ 0 ] === userConfig.trigger )
                {
                    return `Your ${userConfig.botName} is getting a firmware upgrade, please do not press the power button or unplug your computer.`;
                }

                return botText;
            }
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
        console.log( 'AWAYBOT: ', commandType, chalk.green( from ), chalk.red( to ), text );
        return _bot.say ( from, userConfig.botName + '\'s not here, man...' );
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
            var textSplit = origText.split( ' ' );

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

    start();

    return this;
};


function _val( commander )
{
    return new _Val( commander, userConfig );
}


var connectionTimer     = null;
var up                  = Date.now();
var lastPing            = Date.now();

var userConfig          = require( './config/_val.config.js' );
var packageJSON         = require( './package.json' );
    userConfig.version  = packageJSON.version;
var req                 = userConfig.req = {};

    req.http            = require( 'http' ),
    req.https           = require( 'https' ),
    req.fs              = require( 'fs' ),
    req.chalk           = require( 'chalk' );

    userConfig.commandModules   = [];


var commanders  = userConfig.command;
var cores       = [];
var commandObj;

for ( var _c in commanders )
{
    commandObj = commanders[ _c ];

    if ( commandObj.disabled !== true )
    {
        cores.push( _val( _c ) );
    }
}

module.exports = cores;

