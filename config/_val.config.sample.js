
const getMoment = function()
{
    const date = new Date();
    const hours = date.getHours();

    if ( 8 < hours )
    {
        if ( hours < 12 )
        {
            return 'morning';
        }
        if ( hours < 17 )
        {
            return 'day';
        }
        if ( hours < 22 )
        {
            return 'evening';
        }
    }

    return 'night';
};


const userConfig = {

    command     : {

        web     : {
            url                     : './modules/core/web.js',
            botName                 : '_valpi',
            host                    : '192.168.0.1',
            port                    : 666,
            coreConfig              : {
                trigger                 : '',
                usernamePrefix          : [],
                enablePM                : false,
                disabledModules         : [
                    'Admin',
                    'Anagramm',
                    'Twitter',
                    'Words',
                    'Nico'
                ]
            }
        },


        twitter : {
            url                     : './modules/core/twitter.js',
            botName                 : '@example',
            consumerKey             : 'moon1moon1moon1moon1',
            consumerSecret          : 'moon1moon1moon1moon1moon1moon1moon1',
            accessToken             : 'moon1moon1moon1moon1moon1',
            accessTokenSecret       : 'moon1moon1moon1moon1moon1moon1moon1',
            coreConfig              : {
                trigger                 : '@example ',
                usernamePrefix          : [],
                enablePM                : false,
                nico                    : '@nbrugneaux',
                disabledModules         : [
                    'Admin',
                    'Anagramm',
                    'CAH',
                    'Twitter',
                    'Words'
                ]
            }
        },


        slackulon       : {
            url                     : './modules/core/slack.js',
            botName                 : 'val-bot',
            apiKey                  : 'moon1moon1moon1moon1moon1moon1moon1moon1',
            slackTeam               : 'spaaceteam101',
            channelsPrivateJoin     : []
        },


        telegram    : {
            url                     : './modules/core/telegram.js',
            botName                 : 'val2000bot',
            apiKey                  : 'moon1moon1moon1moon1moon1moon1moon1',
            coreConfig              : {
                trigger                 : '/',
                enablePM                : false
            }
        },


        ircExample : {
            url                     : './modules/core/irc.js',
            botName                 : 'valulon',
            server                  : 'chat.freenode.net',
            serverPassword          : 'password123',
            floodProtection         : true,
            floodProtectionDelay    : 50,
            sasl                    : true,
            coreConfig              : {
                usernamePrefix          : [],
                channels                : [
                    'your-mom'
                ],
                enablePM                : false,
                disabledModules         : [
                    'Admin',
                    'Anagramm',
                    'CAH',
                    'DnD',
                    'Doge',
                    'Jetlore',
                    'Music',
                    'Nico',
                    'Twitch',
                    'Twitter',
                    'Words'
                ]
            }
        }
    },


    language : {
        guys    : {
            enabled : true,
            url     : './modules/languageParsers/checkGuys.js',
        },

        troll   : {
            enabled : true,
            url     : './modules/languageParsers/trollOn.js',
        }
    },


    /**
     * timout for a user to be considered active
     **/
    activeTime              : 600000,

    /**
     * admins get to issue admin commands
     **/
    admins                  : [ 'user' ],

    /**
     * connection to nickserv bot.  in twitch, users are already identified,
     * so there in no need for NickServ
     */
    autoAuth                : false,

    /**
     * commands from bots are ignored
     **/
    bots                    : [ 'bot1', 'bot2', 'bot3' ],

    /**
     * server, channel, name connection details
     **/
    channels                : [ '#channel-bots', '#channel1', '#channel2', '#channel3', '#channel4', '#channel5', '#channel6' ],

    /**
     * some services (**cough* twitch**) dont support private messages or
     * multiline messages.
     */
    enableHelp              : true,

    /**
     * enables private messages
     */
    enablePM                : true,

    /**
     * anything ending in 'fetti'
     */
    fettiWordLength         : 15,
    fettiLength             : 25,
    fettiOptions            : [ '. ', '´ ', '\' ', ' ,' ],

    floodProtection         : false,
    floodProtectionDelay    : 1200,

    months                  : [ 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec' ],

    nickservBot             : 'NickServ',
    nickservAPI             : 'Help, I\'m trapped in an api factory',

    /**
     * sets the default target for shenanigans
     */
    nico                    : 'nico',

    /**
     * ms to reconnection on disconnect
     */
    reconnectionTimeout     : 50000,

    /**
     * trigger to catch commands
     **/
    trigger                 : '!',

    /**
     * acceptable prefixes for usernames.  this will ALWAYS pull this character
     * out of the text if it's the first character of a word.  It is designed
     * for compatability with other services that use characters as a reference
     * for users (@user)
     **/
    usernamePrefix         : [ '@' ],

    /**
     * outputs raw messages to the node console
     */
    verbose                 : true,

    /**
     * provided in config in case translations are necessary
     */
    weekdays                : [ 'Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.' ]
};

module.exports = userConfig;

