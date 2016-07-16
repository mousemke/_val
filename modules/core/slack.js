
const slack               = require('@slack/client');
const RtmClient           = slack.RtmClient;
const CLIENT_EVENTS       = slack.CLIENT_EVENTS;
const RTM_EVENTS          = slack.RTM_EVENTS;
const RTM_CLIENT_EVENTS   = slack.CLIENT_EVENTS.RTM;
const MemoryDataStore     = slack.MemoryDataStore;

/**
 * ## val slack loader
 *
 * @return _Object_ slack chatbot
 */
module.exports =  function slackBot( userConfig, _bot, channels, listenToMessages, displayDebugInfo, context )
{
    let slackConfig = userConfig.command.slack;
    let token       = slackConfig.apiKey;
    let dataStore   = new MemoryDataStore();
    _bot            = new RtmClient( token, { dataStore } );

    userConfig.command.slack.botName = _bot.dataStore.getUserById( _bot.activeUserId );

    let boundListenToMessages = listenToMessages.bind( context );

    userConfig.commandModules.push( _bot );


    _bot.on( RTM_EVENTS.MESSAGE, message =>
    {
        let { type, subtype, hidden } = message;

        if ( !hidden && message.user && message.channel )
        {
            let from        = message.channel;
            let to          = message.user;

            let botText     = message.text;

            /*
             * replaces useless slack identifiers with names
             */
            botText = botText.replace( /<@([Uu][A-Za-z0-9]{4,})>/g, ( match, user ) =>
            {
                let userName = _bot.dataStore.getUserById( user );

                return userName ? userName.name : user;
            } );

            let channel     = `#${_bot.dataStore.getChannelGroupOrDMById( message.channel ).name}`;
            let user        = _bot.dataStore.getUserById( to ).name;

            let confObj = { to, from, user, channel };

            botText         = boundListenToMessages( user, channel, botText, confObj );

            if ( botText && botText !== '' )
            {
                if ( subtype === 'message_changed' )
                {
                    _bot.updateMessage( msg, ( err, res ) =>
                    {
                        msg.text = 'test message update';
                    } );
                }
                else if ( typeof botText.then === 'function' )
                {
                    // refactor to use message updating?
                    // https://github.com/slackhq/node-slack-sdk#update-messages
                    botText.then( text =>
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


    _bot.on( RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, () =>
    {
        _bot.pm = ( to, botText, confObj ) =>
        {
            if ( confObj )
            {
                to = confObj.to;
            }

            _bot._modules.core.apiGet( `https://slack.com/api/im.open?token=${token}&user=${to}`, res =>
            {
                let id = res.channel.id;

                _bot.sendMessage( botText, id );
            } );
        };


        _bot.say = ( from, botText, confObj ) =>
        {
            if ( confObj )
            {
                from = confObj.from;
            }

            _bot.sendMessage( botText, from );
        };
    } );

    _bot.pm     = () => {};
    _bot.say    = () => {};

    _bot.start();

    return _bot;
};
