/**
 * _val Modules
 */

 module.exports = {

    _8Ball       : {
        enabled : true,
        url     : './modules/_8ball.js'
    },


    Anagramm    : {
        enabled : true,
        ini     : true,
        url     : './modules/anagramm.js',
        options : {
            wordnikBaseUrl          : 'http://api.wordnik.com:80/v4/',
            translationBaseUrl      : 'http://mymemory.translated.net/api/',
            newWordVoteNeeded       : 0.6,
            unscramblePointTimeout  : 86400000, // 24 hours
            anagramm                : '#anagramm',
            anagrammDogePayout      : true, // requires module: doge
            anagrammDogeModifier    : 3,
            wordnikAPIKey           : 'wordnik - it works bitches',
        }
    },


    Admin       : {
        enabled : true,
        url     : './modules/admin.js',
        options : {
            adminMessage            : '5 minutes later test. well, this appears to work',
            adminMessageInterval    : 300000, // 5 min
            adminMessageChannels    : [ '#soc-bots' ] // optional.  otherwise it falls back to all channels
        }
    },


    Beats       : {
        enabled : true,
        url     : './modules/beats.js'
    },


    CAH        : {
        enabled : true,
        ini     : true,
        url     : './modules/cah.js',
        options : {
            cahRoom                     : '#mousemke',
            cahMaxMin                   : 5,
            cahMinPlayers               : 3
        }
    },


    Doge        : {
        enabled : true,
        ini     : true,
        url     : './modules/doge.js'
    },


    Foursquare        : {
        enabled : true,
        url     : './modules/_4sq.js',
        options : {
            foursquareID        : '4sq ID - go get one',
            foursquareSecret    : '4sq secret - go get one',
            latLong             : '-88.987,-88.567',
            foursquareSection   : 'food', // food, drinks, coffee, shops, arts, outdoors, sights, trending, specials, nextVenues, topPicks
            foursquareRadius    : 2000 // in meters
        }
    },


    GuildWars   : {
        enabled : true,
        url     : './modules/games/gw2.js',
        options : {
            guildWars2Trigger       : 'gw2',
            guildWars2Room          : '#guildwars',
            guildWars2apiUrl        : 'https://api.guildwars2.com/v2'
        }
    },


    Nico        : {
        enabled : true,
        url     : './modules/nico.js'
    },


    PlainText   : {
        enabled : true,
        url     : './modules/plainText.js'
    },


    Pool        : {
        enabled : true,
        url     : './modules/pool.js',
        options : {
                poolApiUrl          : 'http://192.168.2.15:8001/api/'
        }
    },


    PopKey      : {
        enabled : true,
        url     : './modules/popkey.js',
        options : {
            popKeyAPIKey    : 'api-here'
        }
    },


    Slack      : {
        enabled : false,
        url     : './modules/slack.js',
        options : {
            autoAuth                : true,
            slackAPIKey             : 'you-ad-here',
            /**
             * auto join all available public channels.  overrides the channel
             * config option
             */
            autojoin                : true,

            /**
             * private channels to join
             */
            channelsPrivateJoin     : [ '#secretchannel1', '#secretchannel2' ],

            /**
             * public channels to not join
             */
            channelsPublicIgnore    : [],
        }
    },


    Twitch      : {
        enabled : true,
        url     : './modules/twitch.js',
        options : {
            autoAuth                : true,
            enablePM                : false,
            floodProtection         : true,
            floodProtectionDelay    : 1200
        }
    },


    Words       : {
        enabled : true,
        ini     : true,
        url     : './modules/words.js',
        options : {
            wordnikBaseUrl          : 'http://api.wordnik.com:80/v4/',
            translationBaseUrl      : 'http://mymemory.translated.net/api/',
            newWordVoteNeeded       : 0.6,
            unscramblePointTimeout  : 86400000, // 24 hours
            unscramble              : '#unscramble',
            unscrambleDogePayout    : true, // requires module: doge
            unscrambleDogeModifier  : 1,
            wordnikAPIKey           : 'wordnik - it works bitches',
        }
    },


    XKCD        : {
        enabled : true,
        url     : './modules/xkcd.js',
        options : {
            appUrl      : 'http://xkcd-imgs.herokuapp.com/'
        }
    }
};