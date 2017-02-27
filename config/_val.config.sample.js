
const userConfig = {
    command : {

        web     : {
            url                     : './modules/core/web.js',
            botName                 : '_valpi',
            host                    : '4.1.1.1',
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
            botName                 : '@bob',
            consumerKey             : '1234567890qwerzuiopüasdfghjkl',
            consumerSecret          : '1234567890qwerzuiopüasdfghjkl',
            accessToken             : '1234567890qwerzuiopüasdfghjkl+1234567890qwerzuiopüasdfghjkl',
            accessTokenSecret       : '1234567890qwerzuiopüasdfghjkl',
            coreConfig              : {
                trigger                 : '@self ',
                usernamePrefix          : [],
                enablePM                : false,
                nico                    : '@adsux',
                disabledModules         : [
                    'Admin',
                    'Anagramm',
                    'CAH',
                    'Twitter',
                    'Words'
                ]
            }
        },


        se              : {
            url                     : './modules/core/slack.js',
            botName                 : 'bob',
            apiKey                  : 'xoxb-1234567890qwerzuiopüasdfghjkl',
            slackTeam               : 'mars',
            channelsPrivateJoin     : []
        },


        galaxyPotato    : {
            url                     : './modules/core/slack.js',
            botName                 : 'bob',
            apiKey                  : 'xoxb-1234567890qwerzuiopüasdfghjkl',
            slackTeam               : 'space',
            channelsPrivateJoin     : []
        },


        jshackers       : {
            url                     : './modules/core/slack.js',
            botName                 : 'bob',
            apiKey                  : 'xoxb-1234567890qwerzuiopüasdfghjkl',
            slackTeam               : 'moon',
            channelsPrivateJoin     : []
        },


        telegram    : {
            url                     : './modules/core/telegram.js',
            botName                 : 'bob',
            apiKey                  : '1234567890qwerzuiopüasdfghjkl',
            coreConfig              : {
                trigger                 : '/',
                enablePM                : false
            }
        },

        // irc         : {
        //     url                     : './modules/core/irc.js',
        //     botName                 : 'valaxypotato',
        //     server                  : 'galaxypotato.irc.slack.com',
        //     serverPassword          : 'galaxypotato.6AoUXJFrFp0YxsC3qsyN',
        //     floodProtection         : true,
        //     floodProtectionDelay    : 50
        // }
    },

    activeTime              : 600000,
    admins                  : [ 'mouse', 'michele', 'nico' ],
    autoAuth                : true,
    autoJoin                : true,
    bots                    : [],
    channels                : [],
    disabledModules         : [],
    enableHelp              : true,
    enablePM                : true,
    fettiWordLength         : 15,
    fettiLength             : 25,
    fettiOptions            : [ '. ', '´ ', '\' ', ' ,' ],
    months                  : [ 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec' ],
    nico                    : 'nico',
    reconnectionTimeout     : 80000,
    trigger                 : '+',
    usernamePrefix          : [ '@' ],
    verbose                 : true,
    weekdays                : [ 'Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.' ]
};


module.exports = userConfig;
