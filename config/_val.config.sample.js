
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
                    'Twitter',
                    'Words',
                    'Nico'
                ]
            }
        },


        twitter : {
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
                    'Twitter',
                    'Words'
                ]
            },
            url                     : './modules/core/twitter.js',
        },

        slackulon       : {
            apiKey                  : 'moon1moon1moon1moon1moon1moon1moon1moon1',
            botName                 : 'val-bot',
            channelsPrivateJoin     : [],
            enabled                 : true,
            nameFormat              : n => `<@${n}>`,
            slackTeam               : 'spaaceteam101',
            url                     : './modules/core/slack.js',
            welcomeMessage          : 'welcome to the place!\n\n',
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
            channels                : [
                'your-mom'
            ],
            server                  : 'chat.freenode.net',
            serverPassword          : 'password123',
            floodProtection         : true,
            floodProtectionDelay    : 50,
            sasl                    : true,
            coreConfig              : {
                usernamePrefix          : [],
                disabledModules         : [
                    'DnD',
                    'Doge',
                    'Nico',
                    'Twitter',
                    'Words'
                ]
            }
        }
    },


    language : {
        mtgBrackets : {
            enabled : true,
            url     : './modules/languageParsers/mtgBrackets.js',
        },

        guys        : {
            enabled : true,
            url     : './modules/languageParsers/checkGuys.js',
        },

        nicoBlocker : {
            enabled : true,
            url     : './modules/languageParsers/nicoBlocker.js'
        },

        troll       : {
            enabled : true,
            url     : './modules/languageParsers/trollOn.js',
        }
    },


    /**
     * timeout for a user to be considered active
     **/
    activeTime              : 600000,

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
     * disables the base commands (help, active, etc)
     */
    disableBaseCommands     : true,

    /**
     * modules disabled. mostly here to be disabled per head
     */
    disabledModules         : [],

    /**
     * provided in config in case translations are necessary
     */
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

