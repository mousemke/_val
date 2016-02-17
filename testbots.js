// var channel = '#backend';
var channel = '#bots';

// Create the configuration
var userConfig = {
        server              : '192.168.2.24',
        botName             : [ '_testbot1', '_testbot2', '_testbot3', '_testbot4', '_testbot5' ]
    },

    _bots = {}, irc         = require( 'irc' );


function init()
{
    for ( var i = 0; i < userConfig.botName.length; i++ )
    {
        _bots[ 'bot' + i ] = new irc.Client( userConfig.server, userConfig.botName[i ], {
        channels: [ channel ]
        });
    }

    _bots.bot0.addListener( 'join' + channel, saySomething );
}

function saySomething()
{
    for ( var bot in _bots )
    {
        _bots[ bot ].say( channel, 'moo' );
    }
}

init();
