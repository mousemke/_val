

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
    var modules             = require( './config/_val.modules.js' ),
        guysObj             = require( './lists/guys.js' );
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
     * ## testFunction
     *
     * this function is run with the test command.  it exists purely for feature
     * testing.  otherwise it does nothing
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     *
     * @return _Boolean_  false
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

    const { trigger } = this.userConfig;

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
        },

        help     : {
            module  : 'base',
            f       : helpText,
            desc    : 'returns help text',
            syntax  : [
                `${trigger}help`,
                `${trigger}help <command>`,
            ]
        },

        'isup' : {
            module  : 'base',
            f       : () => 'Yes, but c\'mon!  At least use a full sentence!',
            desc    : 'returns _val\'s current status',
            syntax  : [
                `${trigger}isup`
            ]
        },

        'moon?' : {
            module  : 'base',
            f       : () => 'In 500 million years, the moon will be 14,600 miles farther away than it is right now. When it is that far, total eclipses will not take place',
            desc    : 'learn more about the moon',
            syntax  : [
                `${trigger}moon`
            ]
        },

        test    : {
            module  : 'base',
            f       : testFunction,
            desc    : 'this could honestly be anything.  mostly features are incubated here for later expansion',
            syntax  : [
                `${trigger}test`
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

        if ( ! activeChannel[ to ] && to !== _bot.name &&
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
            botText = `I see ${i} active user`;

            if ( i > 1 || i === 0 )
            {
                botText += 's';
            }

            botText += ` in ${from}`;

            return botText;
        }

        return activeUsers;
    }


    /**
     * ## checkGuys
     *
     * checks for "guys" and/or other words set in the guys.json
     *
     * @param {String} text user text
     *
     * @return _Promise_
     */
    function checkGuys( to, text )
    {
        let botText         = '';

        guysObj.forEach( obj =>
        {
            obj.triggers.forEach( word =>
            {
                if ( botText === '' )
                {
                    let guysRegex   = `(^|\\s)+${word}([\\.!?,\\s]+|$)`;
                    guysRegex       = new RegExp( guysRegex, 'i' );

                    if ( guysRegex.test( text ) )
                    {
                        botText = replaceGuys( to, obj );
                    }
                }
            } );
        } );

        return botText;
    }


    /**
     * ## combineResponses
     *
     * combines two response structures while checking for duplicate keys
     *
     * @param {Object} res responses
     * @param {Object} newRes responses to add
     *
     * @return {Object} combined object
    */
    function combineResponses( res, newRes )
    {
        Object.keys( newRes ).forEach( command =>
        {
            if ( res[ command ] )
            {
                console.warn( `duplicate property ${command}` );
            }
            else
            {
                res[ command ] = newRes[ command ];
            }
        } );

        return res;
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
     * ## helpText
     *
     * displays help text to the channel
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} query search parameter
     *
     * @return {String} help text
     */
    function helpText( from, to, text )
    {
        if ( text.length === 0 || !_bot.responses[ text ] )
        {
            let str = 'available commands: ';

            Object.keys( _bot.responses ).forEach( key =>
            {
                str += ` ${key}, `;
            } );

            return str.slice( 0, str.length - 2 );
        }
        else
        {
            let helpText    = _bot.responses[ text ].desc;
            let syntax      = _bot.responses[ text ].syntax;

            if ( syntax )
            {
                syntax.forEach( s => helpText += `\n${s}` )
            }

            return helpText;
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

        for ( const moduleName in _modules.constructors )
        {
            const modulesConstructor = _modules.constructors[ moduleName ];
            const module = _modules[ moduleName ] = new modulesConstructor( _bot, _modules, userConfig, commandModule );

            function formatResponses( module, name )
            {
                module.responses = module.responses();

                Object.keys( module.responses ).forEach( r =>
                {
                    const res = module.responses[ r ];

                    res.f           = res.f.bind( module );
                    res.moduleName  = name;
                    res.module      = module;
                } );
            };

            formatResponses( module, moduleName );

            _bot.responses = combineResponses( _bot.responses, module.responses );

            if ( module.init )
            {
                module.init();
            }
        }

        _bot._modules = _modules;

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
                console.log( commandType, chalk.green( from ), chalk.red( to ), text );
            }

            text = trimUsernames( text );

            watchActive( from, to );

            text = trollOn( text );

            if ( userConfig.bots.indexOf( to ) === -1 )
            {
                var botText = '';

                if ( text === '_val' || text === '_val?' )
                {
                    return 'yes?';
                }
                else if ( text === '_val!' )
                {
                    return 'what!?';
                }

                botText = checkGuys( to, text );

                if ( text[ 0 ] === userConfig.trigger && text !== userConfig.trigger && botText === '' )
                {
                    text = text.slice( 1 );

                    let textArr     = text.split( ' ' );
                    const command   = textArr[ 0 ];
                    textArr         = textArr.slice( 1 );
                    text            = textArr.join( ' ' );


                    if ( _bot.responses[ command ] )
                    {
                        return _bot.responses[ command ].f( from, to, text, textArr, command, confObj );
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
                    _bot.say( from, botText );
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
     * @param {Object} obj triggered word object
     *
     * @return _String_ suggestion
     */
    function replaceGuys( to, obj )
    {
        var _alternative    = obj.alternatives[ Math.floor( Math.random() * obj.alternatives.length ) ];
        var _speech         = obj.speech[ Math.floor( Math.random() * obj.speech.length ) ];

        return `${to}, ${_speech[ 0 ]}${_alternative}${_speech[ 1 ]}`;
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

