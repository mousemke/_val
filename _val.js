

const _Val = function( commandModuleName, userConfig )
{
    const commandModule = userConfig.command[ commandModuleName ];
    const coreConfig    = commandModule.coreConfig || {};
    const _botConfig    = Object.assign( {}, userConfig, coreConfig );

    const { trigger }   = _botConfig;
    const commandType   = commandModule.botName;
    const req           = userConfig.req;
    const http          = req.http;
    const https         = req.https;
    const fs            = req.fs;
    const chalk         = req.chalk;
    const modulesConfig = require( './config/_val.modules.js' );
    const guysObj       = require( './lists/guys.js' );
    const trollBlacklist = require( './lists/trollBlacklist.js' );

    let channel;
    let _bot;

    const modules       = {};
    let channels        = [];

    const debugChalkBox = {
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
     * @return {Boolean}  false
     */
    function testFunction( from, to, text )
    {
        const nlp = require( 'nlp_compromise' );

        const textObj   = nlp.text( text );
        const textRoot  = textObj.root();
        const terms     = textObj.terms();
        const verb      = nlp.verb( text );

        const sentence  = nlp.sentence( text );
        const sentenceType = sentence.sentence_type();

        const tags      = sentence.tags();
        let botText = '';

        terms.forEach( t =>
        {
            botText += `${t.text}: ${JSON.stringify( t )}\n`;
        } );
return botText;
        // return `root sentence: ${textRoot}
        //             sentence type: ${sentenceType}
        //             verb: ${JSON.stringify( verb.to_present() )}
        //             verb is negative: ${verb.isNegative()}
        //             tags: ${JSON.stringify( tags )}
        //             terms: ${JSON.stringify( terms )}`;
        // return tags;
    }


    /**
     * ## apiGet
     *
     * gets and parses JSON from api sources
     *
     * @param {String} url target url
     * @param {Function} cb callback
     * @param {Boolean} secure https?
     *
     * @return {Void}
     */
    function apiGet( options, cb, secure, from, to )
    {
        secure = !!secure;

        const error = say =>
        {
            if ( say )
            {
                _bot.say( from, `sorry, ${to} bad query or url. (depends on what you were trying to do)` );
            }
            else
            {
                console.warn( `${options} appears to be down` );
            }
        };

        const callback = res =>
        {
            let body = '';

            res.on( 'data', chunk =>
            {
                body += chunk;
            } );

            res.on( 'end', () =>
            {
                let data;

                try
                {
                    data = JSON.parse( body );
                    cb( data );
                }
                catch( e )
                {
                    error( e );
                }
            } );
        };

        try
        {
            if ( secure )
            {
                https.get( options, callback ).on( 'error', function( e )
                {
                    error( _bot );
                } );
            }
            else
            {
                http.get( options, callback ).on( 'error', function( e )
                {
                    error( _bot );
                } );
            }
        }
        catch( e )
        {
            console.log( e );
        }
    }


    /**
     * ## baseResponses
     *
     * val's base responses that both require no modules and are non-optional
     * @type {Object}
     */
    const baseResponses = {
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
     * @return {Void}
     */
    function buildClient()
    {
        /*
         * adds core components to an obj to be passed modules
         */
        modules.core = {

             checkActive    : checkActive,

             userData       : userData,

             apiGet         : apiGet
        };

        modules.constructors = {};

        /**
         * load _val modules
         */
        for ( const moduleName in modulesConfig )
        {
            const module = modulesConfig[ moduleName ];

            if ( module.enabled )
            {
                modules.constructors[ moduleName ] = require( module.url );

                if ( module.options )
                {
                    for ( let option in module.options )
                    {
                        _botConfig[ option ] = module.options[ option ];
                    }
                }
            }
        }
    }


    /**
     * ## buildCore
     *
     * dynamic core loader
     *
     * @return {Void}
     */
    function buildCore()
    {
        const Commander = require( commandModule.url );

        _bot            = new Commander( _botConfig,
                                            channels,
                                            listenToMessages,
                                            displayDebugInfo ,
                                            this,
                                            commandModule
                                        );

        _bot.name       = commandModule.botName;
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
     * @return {Array} active users
     */
    function checkActive( from, to, text, talk )
    {
        let name;
        let i       = 0;
        let now     = Date.now();

        const activeUsers   = [];

        if ( ! _bot.active[ from ] )
        {
            _bot.active[ from ] = {};
        }

        const activeChannel = _bot.active[ from ];

        if ( ! activeChannel[ to ] && to !== _bot.name &&
                _botConfig.bots.indexOf( to ) === -1 )
        {
            activeChannel[ to ] = now;
            now++;
        }

        for ( name in activeChannel )
        {
            if ( now - _botConfig.activeTime < activeChannel[ name ] )
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
     * @return {Promise}
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
     * @return {Void}
     */
    function displayDebugInfo( e )
    {
        const command = e.command;

        if ( command !== 'PRIVMSG' )
        {
            const color = debugChalkBox[ command ];
            let text    = `     * ${command} : `;

            e.args.forEach( arg => text += `${arg} ` );

            if ( color )
            {
                if ( command === 'PING' )
                {
                    const now   = Date.now();
                    let minUp   = `${Math.round( ( ( now - up ) / 1000 / 60 ) * 100 ) / 100 }`;

                    if ( minUp.indexOf( '.' ) === -1 )
                    {
                        minUp += '.00';
                    }
                    else if ( minUp.split( '.' )[ 1 ].length !== 2 )
                    {
                        minUp += '0';
                    }

                    console.log( chalk[ color ]( text ), `${now - lastPing}ms`, chalk.grey( `(${minUp}min up)`, new Date().toLocaleString() ) );
                    lastPing = now;

                    if ( connectionTimer )
                    {
                        clearTimeout( connectionTimer );
                    }

                    connectionTimer = setTimeout( reConnection, _botConfig.reconnectionTimeout );
                }
                else
                {
                    console.log( chalk[ color ]( text ) );
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
     * @return {Void}
     */
    function generateChannelList()
    {
        /**
         * adds private channels from _botConfig.channelsPrivateJoin to the list of
         * channels to join.
         */
        function addPrivateChannels()
        {
            const privateChannels    = commandModule.channelsPrivateJoin;

            if ( privateChannels )
            {
                const privateChannelsLength  = privateChannels.length;

                for ( let i = 0; i < privateChannelsLength; i++ )
                {
                    const channel = privateChannels[ i ];

                    if ( channels.indexOf( channel ) === -1 )
                    {
                        channels.push( channel );
                    }
                }
            }
        }


        /**
         * assembles the channel list and starts the client
         *
         * @return {Void}
         */
        function finishChannels()
        {
            _botConfig.publicChannels = [].concat( channels );

            if ( commandModule.slackTeam )
            {
                addPrivateChannels();
            }

            removeBlacklistChannels();
            _botConfig.channels = channels;

            ini();
        }


        /**
         * if any channels are blacklisted from entering from _botConfig.channelsPublicIgnore,
         * this removes them from the channels array
         */
        function removeBlacklistChannels()
        {
            const blockedChannels       = _botConfig.channelsPublicIgnore || [];
            const blockedChannelsLength = blockedChannels.length;

            if ( blockedChannelsLength )
            {
                for ( let i = 0; i < blockedChannelsLength; i++ )
                {
                    const b = blockedChannels[ i ];

                    const index = channels.indexOf( b );

                    if ( index !== -1 )
                    {
                        channels.splice( index, 1 );
                    }
                }
            }
        }


        if ( commandModule.slackTeam && commandModule.autojoin )
        {
            const url = `https://${commandModule.slackTeam}.slack.com/api/channels.list?token=${userConfig.slackAPIKey}`;

            apiGet( url, function( res )
            {
                const channels = res.channels;

                for ( let channel in channels )
                {
                    channel = channels[ channel ].name;
                    channel = channel[0] !== '#' ? `#${channel}` : channel;

                    channels.push( channel );
                }

                finishChannels();
            }, true );
        }
        else if ( _botConfig.channels )
        {
            channels = _botConfig.channels;
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
        const responses     = _bot.responses;
        const responseText  = responses[ text ];

        if ( text.length === 0 || !responseText )
        {
            let str = 'available commands: ';

            Object.keys( responses ).forEach( key =>
            {
                str += ` ${key}, `;
            } );

            return str.slice( 0, str.length - 2 );
        }
        else
        {
            let helpText    = responseText.desc;
            const syntax    = responseText.syntax;

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
     * @return {Void}
     */
    function ini()
    {
        buildCore();

        _bot.active     = {};
        _bot.responses  = baseResponses;

        for ( const moduleName in modules.constructors )
        {
            if ( _botConfig.disabledModules.indexOf( moduleName ) === -1 )
            {
                const modulesConstructor = modules.constructors[ moduleName ];
                const module = modules[ moduleName ] = new modulesConstructor( _bot, modules, _botConfig, commandModule );

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
            }
        }

        _bot.modules = modules;

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
     * @return {Void}
     */
    function listenToMessages( to, from, text, confObj )
    {
        if ( text )
        {
            if ( _botConfig.verbose === true )
            {
                console.log( commandType, chalk.green( from ), chalk.red( to ), text );
            }

            text = trimUsernames( text );

            watchActive( from, to );

            text = trollOn( text );

            if ( _botConfig.bots.indexOf( to ) === -1 )
            {
                let botText = '';

                if ( text === '_val' || text === '_val?' )
                {
                    return 'yes?';
                }
                else if ( text === '_val!' )
                {
                    return 'what!?';
                }

                botText = checkGuys( to, text );

                const trigger       = _botConfig.trigger;
                const triggerLength = trigger.length;

                if ( text.slice( 0, triggerLength ) === trigger && text !== trigger && botText === '' )
                {
                    text = text.slice( triggerLength );

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
            else if ( _botConfig.bots.indexOf( to ) !== -1 &&
                ( text[ 0 ] ===  _botConfig.trigger && text !==  _botConfig.trigger ) )
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
     * @return {Void}
     */
    function listenToPm( from, text )
    {
        // var textSplit   = text.split( ' ' );
        // var command     = textSplit[ 0 ];

        // if ( command[0] === _botConfig.trigger )
        // {
        //     command = command.slice( 1 );
        // }

        // if ( _botConfig.admins.indexOf( from ) !== -1 )
        // {
        //     switch ( command )
        //     {
        //         case 'die':
        //             _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
        //             {
        //                 console.log( from + ' killed me' );
        //             });
        //             break;
        //         default:
        //             listenToMessages( from, from, text, command );
        //     }
        // }
        // else
        // {
        //     switch ( command )
        //     {
        //         case 'help':
        //             botText = _botConfig.helpText();
        //             _bot.say( from, botText );
        //             botText = '';
        //             break;
        //         default:
        //             listenToMessages( from, from, text, command );
        //     }
        // }
    }


    /**
     * ## reConnection
     *
     * disconnects and reconnects _val
     *
     * @return {Void}
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
     * @return {String} suggestion
     */
    function replaceGuys( to, obj )
    {
        const alternative   = obj.alternatives[ Math.floor( Math.random() *
                                                    obj.alternatives.length ) ];

        const speech        = obj.speech[ Math.floor( Math.random() *
                                                    obj.speech.length ) ];

        return `${to}, ${speech[ 0 ]}${alternative}${speech[ 1 ]}`;
    }


    /**
     * ## start
     *
     * start the thing!
     *
     * @return {Void}
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
     * @return {String}
     */
    function trimUsernames( text )
    {
        if ( _botConfig.usernamePrefix && _botConfig.usernamePrefix.length > 0 )
        {
            text = text.split( ' ' );

            for ( let i = 0, lenI = text.length; i < lenI; i++ )
            {
                if ( _botConfig.usernamePrefix.indexOf( text[ i ][0] ) !== -1 )
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
        const textSplit = text.split( ' ' );

        for ( let i = 0, lenI = textSplit.length; i < lenI; i++ )
        {
            if ( trollBlacklist.indexOf( textSplit[ i ] ) !== -1 )
            {
                return text;
            }
        }

        if ( text.toLowerCase().indexOf( 'troll' ) !== -1 )
        {
            text = _botConfig.trigger + 'trollfetti';
        }
        else if ( text.toLowerCase().indexOf( 'trøll' ) !== -1 )
        {
            text = _botConfig.trigger + 'trøllfetti';
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
     * @param {Function} cb callback
     * @param {String} origText original message text
     *
     * @return {Void}
     */
    function userData( to, from, cb, origText )
    {
        if ( _botConfig.autoAuth )
        {
            const textSplit = origText.split( ' ' );

            cb( to, 'true', textSplit, origText );
        }
        else
        {
            const response = function( _from, text )
            {
                _bot.removeListener( 'pm', response );

                const textSplit     = text.split( ' ' );
                const apiReturn     = textSplit[ 0 ];
                const returnMessage = textSplit[ 1 ];
                const user          = textSplit[ 2 ];
                const result        = textSplit[ 3 ];

                if ( apiReturn === _botConfig.nickservAPI &&
                    returnMessage === 'identified' && user === to &&
                                                            result === 'true' )
                {
                    cb( to, result, textSplit, origText );
                }
                else if ( apiReturn === _botConfig.nickservAPI &&
                            returnMessage === 'identified' && user === to &&
                            result === 'false' )
                {
                    _bot.say( to,
                            'You are not identified. (/msg NickServ help)' );
                }
                else if ( apiReturn === _botConfig.NickservAPI &&
                            returnMessage === 'notRegistered' && user === to )
                {
                    _bot.say( to,
                        'You are not a registered user. (/msg NickServ help)' );
                }
            };

            _bot.addListener( 'pm', response );

            _bot.say( _botConfig.nickservBot,
                                `${_botConfig.nickservAPI} identify ${to}` );
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
     * @return {Void}
     */
    function watchActive( from, to )
    {
        const ignoreTheBots = _botConfig.bots || [];

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


let connectionTimer = null;
let up              = Date.now();
let lastPing        = Date.now();

const userConfig    = require( './config/_val.config.js' );
const packageJSON   = require( './package.json' );
userConfig.version  = packageJSON.version;
const req           = userConfig.req = {};

req.http            = require( 'http' ),
req.https           = require( 'https' ),
req.fs              = require( 'fs' ),
req.chalk           = require( 'chalk' );

userConfig.commandModules   = [];

const commanders    = userConfig.command;
const cores         = [];

let commandObj;

for ( let commander in commanders )
{
    commandObj = commanders[ commander ];

    if ( commandObj.disabled !== true )
    {
        cores.push( _val( commander ) );
    }
}

module.exports = cores;

