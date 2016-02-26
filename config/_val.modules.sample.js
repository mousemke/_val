/**
 * _val Modules
 *
 * watch your options property names.  their names should reflect their module, as
 * they are all moved into the same namespace for intercompatability.  All option will be transfered.
 */

 module.exports = {

    _8Ball       : {
        enabled : true,
        url     : './modules/_8ball.js'
    },


    Admin       : {
        enabled : false,
        url     : './modules/admin.js',
        options : {
            adminMessage            : '5 minutes later test. well, this appears to work',
            adminMessageInterval    : 300000, // 5 min
            adminMessageChannels    : [ '#bots' ] // optional default.  otherwise it falls back to all channels
        }
    },


    Anagramm    : {
        enabled : false, // requires module: words
        ini     : true,
        url     : './modules/anagramm.js',
        options : {
            anagrammLang            : 'de',
            anagrammChannel         : '#bots',
            anagrammDogePayout      : true, // requires module: doge
            anagrammDogeModifier    : 3,
            anagrammPointTimeout    : 86400000, // 24 hours
            newWordVoteNeeded       : 0.6,
            wordnikBaseUrl          : 'http://api.wordnik.com:80/v4/',
            translationBaseUrl      : 'http://mymemory.translated.net/api/',
            wordnikAPIKey           : 'api-key'
        }
    },


    Beats       : {
        enabled : true,
        url     : './modules/beats.js'
    },


    CAH        : {
        enabled : false,
        ini     : true,
        url     : './modules/cah.js',
        options : {
            cahRoom                     : '#cards_against_humanity',
            cahMaxMin                   : 5,
            cahMinPlayers               : 3
        }
    },


    Doge        : {
        enabled : false,
        ini     : true,
        url     : './modules/doge.js'
    },


    Foursquare        : {
        enabled : false,
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
        enabled : false,
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


    PopKey      : {
        enabled : false,
        url     : './modules/popkey.js',
        options : {
            popKeyComtentFilter : true,
            popKeyAPIKey        : 'api-here'
        }
    },


    RR          : {
        enabled : true,
        ini     : true,
        url     : './modules/rr.js',
    },


    Slack      : {
        enabled : false,
        url     : './modules/slack.js',
        options : {
            autoAuth                : true,

            slackChannel            : 'company-or-whatever',

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
        enabled : false,
        url     : './modules/twitch.js',
        options : {
            autoAuth                : true,
            enablePM                : false,
            floodProtection         : true,
            floodProtectionDelay    : 1200
        }
    },


    Twitter     : {
        enabled : false,
        ini     : true,
        url     : './modules/twitter.js',
        options : {
            twitterRooms : {
                'mouse' : {
                    account             : '@mousemke',
                    users               : [ 'user1' ],
                    consumerKey         : '1234567890',
                    consumerSecret      : '1234567890',
                    accessToken         : '1234567890-1234567890',
                    accessTokenSecret   : '1234567890',
                },
                '#val-test' : {
                    account             : '@mousemke',
                    users               : [ 'user1' ],
                    consumerKey         : '1234567890',
                    consumerSecret      : '1234567890',
                    accessToken         : '1234567890-1234567890',
                    accessTokenSecret   : '1234567890',
                },
                '#_teamdoinstuff' : {
                    account             : '@teamdoinstuff',
                    users               : [ 'user1', 'user2', 'user3' ],
                    consumerKey         : '1234567890',
                    consumerSecret      : '1234567890',
                    accessToken         : '1234567890-1234567890',
                    accessTokenSecret   : '1234567890',
                }
            },
            twitterUsersBlackList       : [ 'userBad' ]
        }
    },


    Words       : {
        enabled : false,
        ini     : true,
        url     : './modules/words.js',
        options : {
            wordsLang               : 'en',
            wordsChannel            : '#bots',
            wordsDogePayout         : true, // requires module: doge
            wordsDogeModifier       : 1,
            wordsPointTimeout       : 86400000, // 24 hours
            newWordVoteNeeded       : 0.6,
            wordnikBaseUrl          : 'http://api.wordnik.com:80/v4/',
            translationBaseUrl      : 'http://mymemory.translated.net/api/',
            wordnikAPIKey           : 'api-key'
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