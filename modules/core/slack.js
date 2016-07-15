
var slack               = require('@slack/client');
var RtmClient           = slack.RtmClient;
var CLIENT_EVENTS       = slack.CLIENT_EVENTS;
var RTM_EVENTS          = slack.RTM_EVENTS;
var RTM_CLIENT_EVENTS   = slack.CLIENT_EVENTS.RTM;
var MemoryDataStore     = slack.MemoryDataStore;

/**
 * ## val slack loader
 *
 * @return _Object_ slack chatbot
 */
module.exports = function slackBot( userConfig, _bot, channels, listenToMessages, displayDebugInfo, context )
{
    var slackConfig = userConfig.command.slack;
    var token       = slackConfig.apiKey;
    var _bot        = new RtmClient( token, { dataStore: new MemoryDataStore() } );

    userConfig.command.slack.botName = _bot.dataStore.getUserById( _bot.activeUserId );

    var boundListenToMessages = listenToMessages.bind( context );

    userConfig.commandModules.push( _bot );

    _bot.start();

    _bot.on( RTM_EVENTS.MESSAGE, function( message )
    {
        var msgType     = message.type;
        var msgSubtype  = message.subtype;
        var msgHidden   = message.hidden;

        if ( !msgHidden && message.user && message.channel )
        {
            var from        = message.channel;
            var to          = message.user;
            var botText     = message.text;


            var channel     = _bot.dataStore.getChannelGroupOrDMById( message.channel ).name;
            var user        = _bot.dataStore.getUserById( message.user ).name;

            var confObj = { to: to, from: from, user: user, channel: channel };

            botText         = boundListenToMessages( user, channel, botText );

            if ( botText && botText !== '' )
            {
                if ( msgSubtype === 'message_changed' )
                {
                    _bot.updateMessage( msg, function( err, res )
                    {
                        msg.text = 'test message update';
                    } );
                }
                else if ( typeof botText.then === 'function' )
                {
                    // refactor to use message updating?
                    // https://github.com/slackhq/node-slack-sdk#update-messages
                    botText.then( function( text )
                    {
                        _bot.say( from, text, confObj );
                    } );
                }
                else
                {
                    _bot.say( from, botText, confObj );
                }
            }
        }
    } );


    _bot.on( RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function()
    {
        _bot.say = function( from, botText, confObj )
        {
            if ( confObj )
            {
                from = confObj.from;
            }

            _bot.sendMessage( botText, from );
        };
    } );

    _bot.say = function(){};

    return _bot;
};
