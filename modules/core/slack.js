
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
        var from    = message.channel;
        var to      = message.user;
        var botText = message.text;

        var user    = _bot.dataStore.getUserById( message.user );

        var confObj = { to: to, user: user };

        var botText = boundListenToMessages( to, from, botText );

        if ( botText !== '' && botText !== false )
        {
            if ( typeof botText.then === 'function' )
            {
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
    } );


    _bot.on( RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function()
    {
        _bot.say = function( from, botText, confObj )
        {
            if ( confObj )
            {
                console.log( confObj.to, confObj.user.name, botText );
                botText = botText.replace( confObj.to, confObj.user.name );
            }

            _bot.sendMessage( botText, from );
        };
    } );

    _bot.say = function(){};

    return _bot;
};
