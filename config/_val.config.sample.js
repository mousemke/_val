
var getMoment = function()
{
    var date = new Date();
    var hours = date.getHours();

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


var helpText = function()
{
    return 'Moin Moin!  My name is ' + ( userConfig.botName ) + ', and I\'ll be your IRC bot for the' + getMoment() + '. ' +
            'Valid commands are listed here: ' + ( userConfig.helpUrl );
};


var userConfig = {

    /**
     * commands from bots are ignored
     **/
    bots                    : [ 'bot1', 'bot2', 'bot3' ],

    /**
     * admins get to issue admin commands
     **/
    admins                  : [ 'user' ],

    /**
     * server, channel, name connection details
     **/
    channels                : [ '#channel-bots', '#channel1', '#channel2', '#channel3', '#channel4', '#channel5', '#channel6' ],
    server                  : '192.168.1.1',
    serverPassword          : 'just.another.irc.server.password.i.suppose',
    botName                 : 'justAnotherBot',

    /**
     * trigger to catch commands
     **/
    trigger                 : 'ß',

    /**
     * timout for a user to be considered active
     **/
    activeTime              : 600000,

    /**
     * anything ending in 'fetti'
     */
    fettiWordLength         : 15,
    fettiLength             : 25,
    fettiOptions            : [ '. ', '´ ', '\' ', ' ,' ],

    /**
     * connection to nickserv bot.  in twitch, users are already identified,
     * so there in no need for NickServ
     */
    autoAuth                : false,
    nickservBot             : 'NickServ',
    nickservAPI             : 'Help, I\'m trapped in an api factory',

    /**
     * uses the wordnik api for words and mymemory for translations
     * runs german and english (and potentially any language) word scramble
     */
    enableWords             : true,
    wordnikBaseUrl          : 'http://api.wordnik.com:80/v4/',
    translationBaseUrl      : 'http://mymemory.translated.net/api/',
    newWordVoteNeeded       : 0.6,
    unscramblePointTimeout  : 86400000, // 24 hours
    unscramble              : '#unscramble',
    anagramm                : '#anagramm',
    wordnikAPIKey           : 'wordnik - it works bitches',

    /**
     * uses the leaderboard api to track pool scores
     * https://github.com/nicolasbrugneaux/leaderboard
     */
    enablePool              : true,
    poolApiUrl              : 'http://192.168.2.15:8001/api/',

    /**
     * go get yo' self a foursquare api key
     * this is mainly used to find new lunch places around Sociomantic Labs.
     * change the latLong for other locations.
     */
    enableFoursquare        : true,
    foursquareID            : '4sq ID - go get one',
    foursquareSecret        : '4sq secret - go get one',
    latLong                 : '-88.987,-88.567',

    /**
     * some services (**cough* twitch**) dont support private messages or
     * multiline messages.
     */
    enableHelp              : true,
    helpUrl                 : 'http://knoblau.ch/_val/',
    helpText                : helpText,

    /**
     * disables private messages
     */
    enablePM                : true,

    /**
     * special modes that configure for services
     */
    twitchMode              : false
};


if ( userConfig.twitchMode )
{
    userConfig.autoAuth             = true;
    userConfig.enableWords          = false;
    userConfig.enableFoursquare     = false;
    userConfig.enablePM             = false;
}


module.exports = userConfig;

