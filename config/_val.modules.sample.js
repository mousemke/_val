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
        enabled : true,
        url     : './modules/admin.js',
        options : {
            admins  : [ 'user' ]
        }
    },


    Allthemaths : { // not included - https://www.npmjs.com/package/allthemaths
        enabled : false,
        url     : './node_modules/allthemaths/allthemaths.js'
    },


    Anagramm    : {
        enabled : true, // requires module: words
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
        enabled : true,
        url     : './modules/cah.js',
        options : {
            cahRoom                     : '#cards_against_humanity',
            cahMaxMin                   : 5,
            cahMinPlayers               : 3
        }
    },


    DnD         : {
        enabled : true,
        url     : './modules/dnd.js',
        options : {
            dndRooms                    : [ '#wizardlands' ], // '*' for all
            dndMaxDice                  : 100
        }
    },


    Doge        : {
        enabled : true,
        url     : './modules/doge.js',
        options : {
            dogeTicker: {
                enabled: true,
                channels: {
                    G8E3JTD7B: {
                        accts: [
                            'DWalLETNumBER1',
                            'DWalLETNumBER2',
                            'DWalLETNumBER4'
                        ],
                        timeout: 30
                    },
                    C59PDK5T7: {
                        accts: 1000000,
                        timeout: 30
                    }
                }
            }
        }
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
        url     : './modules/gw2.js',
        options : {
            guildWars2Trigger       : 'gw2',
            guildWars2Room          : '#guildwars',
            guildWars2apiUrl        : 'https://api.guildwars2.com/v2'
        }
    },


    Mtg         : {
        enabled : true,
        url     : './modules/mtg.js'
    },


    Nico        : {
        enabled : true,
        url     : './modules/nico.js'
    },


    PlainText   : {
        enabled : true,
        url     : './modules/plainText.js',
        options : {
            plainTextFettiWordLength    : 15,
            plainTextFettiLength        : 25,
            plainTextFettiOptions       : [ '. ', '´ ', '\' ', ' ,' ]
        }
    },


    PopKey      : {
        enabled : true,
        url     : './modules/popkey.js',
        options : {
            popKeyContentFilter : true,
            popKeyAPIKey        : 'api-here'
        }
    },


    RR          : {
        enabled : true,
        url     : './modules/rr.js',
    },


    Test          : {
        enabled : true,
        url     : './modules/test.js',
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


    Twitter     : {
        enabled : true,
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
        enabled : true,
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
            xkcdAppUrl      : 'http://xkcd-imgs.herokuapp.com/'
        }
    },


    U   : {
        enabled : true,
        url     : './modules/u.js'
    }
};
