
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

    /**
     * channels that ignore seen (private channels ignore seen anyways)
     */
    channelsSeenIgnore      : [ '#channel4' ],

    /**
     * ms to reconnection on disconnect
     */
    reconnectionTimeout     : 50000,

    server                  : '192.168.1.1',
    serverPassword          : 'just.another.irc.server.password.i.suppose',
    botName                 : 'justAnotherBot',
    floodProtection         : false,
    floodProtectionDelay    : 1200,

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
     * timout for a user to be considered active
     **/
    activeTime              : 600000,

    /**
     * sets a target for shenanigans
     */
    nico                    : 'nico',

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
     * uses the leaderboard api to track pool scores
     * https://github.com/nicolasbrugneaux/leaderboard
     */
    enablePool              : true,
    poolApiUrl              : 'http://192.168.2.15:8001/api/',

    /**
     * some services (**cough* twitch**) dont support private messages or
     * multiline messages.
     */
    enableHelp              : true,
    helpUrl                 : 'http://knoblau.ch/_val/',
    helpText                : helpText,

    /**
     * enables private messages
     */
    enablePM                : true,

    /**
     * provided in config in case translations are necessary
     */
    weekdays                : [ 'Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.' ],
    months                  : [ 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec' ],

    /**
     * outputs raw messages to the node console
     */
    verbose                 : true
};

module.exports = userConfig;

