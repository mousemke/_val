var getMoment = function()
{
    var date = new Date;
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

var triggerify = function( str )
{
    return str.replace( /__TRIGER__/g, userConfig.trigger );
}

var helpText = function()
{
    return triggerify( 'Hi!  My name is ' + ( userConfig.botName ) + ', and I\'ll be your IRC bot for the' + getMoment() + '.\n' +
            'Valid commands are:     \n' +
        '__TRIGER__help\n' +
        '__TRIGER__doge (<amount>)\n' +
        '__TRIGER__market (<amount>)\n' +
        '__TRIGER__tip <user> <amount>\n' +
        '__TRIGER__withdraw <address> [ <amount> ]  (costs a Ð1 transaction fee)\n' +
        '__TRIGER__deposit\n' +
        '__TRIGER__balance\n' +
        '__TRIGER__soak <amount>\n' +
        '__TRIGER__active\n' +
        '__TRIGER__google <query>\n' +
        '__TRIGER__define <word>\n' +
        '__TRIGER__pool (<name or number>)\n' +
            '* market, doge, balance, withdraw, & deposit are also available as a pm\n' +
            'for more help, try ".help -v" or ".help unscramble"' );
};

var helpTextSecondary = function()
{
    return triggerify ( '\n' +
        '__TRIGER__konami\n' +
        '__TRIGER__rain\n' +
        '__TRIGER__dance\n' +
        '__TRIGER__domo\n' +
        '__TRIGER__barrelroll\n' +
        '__TRIGER__hedgehog\n' +
        '__TRIGER__lurk\n' +
        '__TRIGER__lurkbear\n' +
        '__TRIGER__wave\n' +
        '__TRIGER__internet\n' +
        '__TRIGER__cornflakes\n' +
        '__TRIGER__snowflakes\n' +
        '__TRIGER__whale\n' +
        '__TRIGER__safety\n' +
        '__TRIGER__bot\n' +
        '__TRIGER__dodge (<name>)\n' +
        '__TRIGER__g <query>\n' +
        '__TRIGER__witchhunt\n' +
        '__TRIGER__innovation\n' +
        '__TRIGER__flipthetable\n' +
        '__TRIGER__chilloutbro\n' +
        '__TRIGER__putthetableback\n' +
        '__TRIGER__vampire\n' +
        '__TRIGER__ping' );
};


var helpTextUnscramble = function()
{
    return triggerify( '\n' +
        '__TRIGER__word\n' +
        '__TRIGER__newWord\n' +
        '__TRIGER__define' );
};

var userConfig = {
    bots                    : [ 'bot1', 'bot2', 'bot3' ],
    admins                  : [ 'user' ],
    channels                : [ '#channel-bots', '#channel1', '#channel2', '#channel3', '#channel4', '#channel5', '#channel6' ],
    server                  : '192.168.1.1',
    serverPassword          : 'just.another.irc.server.password.i.suppose',
    botName                 : 'justAnotherBot',
    trigger                 : 'ß',
    api                     : 'Help, I\'m trapped in an api factory',
    dcAddress               : 'DDIHaveNoIdeaWhatImDoing',
    activeTime              : 600000,
    fettiWordLength         : 15,
    fettiLength             : 25,
    fettiOptions            : [ '. ', '´ ', '\' ', ' ,' ],

    autoAuth                : false,
    nickservBot             : 'NickServ',

    enableWords             : true,
    newWordVoteNeeded       : 0.6,
    unscramblePointTimeout  : 86400000, // 24 hours
    unscramble              : '#unscramble',
    anagramm                : '#anagramm',
    wordnikAPIKey           : 'wordnik - it works bitches',

    enableFoursquare        : true,
    foursquareID            : '4sq ID - go get one',
    foursquareSecret        : '4sq secret - go get one',
    latLong                 : '-88.987,-88.567',

    enableHelp              : true,
    helpText                : helpText,
    helpTextSecondary       : helpTextSecondary,
    helpTextUnscramble      : helpTextUnscramble,

    enablePM                : true,

    twitchMode              : false
};

if ( userConfig.twitchMode )
{
    userConfig.autoAuth             = true,
    userConfig.enableHelp           = false,
    userConfig.enableWords          = false,
    userConfig.enableFoursquare     = false,
    userConfig.enablePM             = false
}

module.exports = userConfig;

