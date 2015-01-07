userConfig = {
    bots                : [ 'bot1', 'bot2', 'bot3' ],
    admins              : [ 'user' ],
    channels            : [ '#channel-bots', '#channel1', '#channel2', '#channel3', '#channel4', '#channel5', '#channel6' ],
    server              : '192.168.1.1',
    botName             : 'justAnotherBot',
    trigger             : 'ß',
    dcAddress           : 'DDIHaveNoIdeaWhatImDoing',
    api                 : 'Help, I\'m trapped in an api factory',
    activeTime          : 600000,
    nickservBot         : 'NickServ',
    fettiWordLength     : 15,
    fettiLength         : 25,
    fettiOptions        : [ '. ', '´ ', '\' ', ' ,' ],
    unscramble          : '#unscramble',
    anagramm            : '#anagramm',
    foursquareID        : '4sq ID - go get one',
    foursquareSecret    : '4sq secret - go get one',
    latLong             : '-88.987,-88.567',
    wordnikAPIKey       : 'wordnik - it works bitches'
};


userConfig.helpText    = 'Hi!  My name is ' + ( userConfig.botName ) + ', and I\'ll be your IRC bot for the evening.\n' +
            'Valid commands are:     \n' +
            ( userConfig.trigger ) + 'help\n' +
            ( userConfig.trigger ) + 'doge (<amount>)\n' +
            ( userConfig.trigger ) + 'market (<amount>)\n' +
            ( userConfig.trigger ) + 'tip <user> <amount>\n' +
            ( userConfig.trigger ) + 'withdraw <address> [ <amount> ]  (costs a Ð1 transaction fee)\n' +
            ( userConfig.trigger ) + 'deposit\n' +
            ( userConfig.trigger ) + 'balance\n' +
            ( userConfig.trigger ) + 'soak <amount>\n' +
            ( userConfig.trigger ) + 'active\n' +
            ( userConfig.trigger ) + 'google <query>\n' +
            ( userConfig.trigger ) + 'define <word>\n' +
            ( userConfig.trigger ) + 'pool (<name or number>)\n' +
            '* market, doge, balance, withdraw, & deposit are also available as a pm\n' +
            'for more help, try ".help -v" or ".help unscramble"';

userConfig.helpTextSecondary =  '\n' +
            ( userConfig.trigger ) + 'konami\n' +
            ( userConfig.trigger ) + 'rain\n' +
            ( userConfig.trigger ) + 'dance\n' +
            ( userConfig.trigger ) + 'domo\n' +
            ( userConfig.trigger ) + 'barrelroll\n' +
            ( userConfig.trigger ) + 'hedgehog\n' +
            ( userConfig.trigger ) + 'lurk\n' +
            ( userConfig.trigger ) + 'lurkbear\n' +
            ( userConfig.trigger ) + 'wave\n' +
            ( userConfig.trigger ) + 'internet\n' +
            ( userConfig.trigger ) + 'cornflakes\n' +
            ( userConfig.trigger ) + 'snowflakes\n' +
            ( userConfig.trigger ) + 'whale\n' +
            ( userConfig.trigger ) + 'safety\n' +
            ( userConfig.trigger ) + 'bot\n' +
            ( userConfig.trigger ) + 'dodge (<name>)\n' +
            ( userConfig.trigger ) + 'g <query>\n' +
            ( userConfig.trigger ) + 'witchhunt\n' +
            ( userConfig.trigger ) + 'innovation\n' +
            ( userConfig.trigger ) + 'flipthetable\n' +
            ( userConfig.trigger ) + 'chilloutbro\n' +
            ( userConfig.trigger ) + 'putthetableback\n' +
            ( userConfig.trigger ) + 'vampire\n' +
            ( userConfig.trigger ) + 'ping';


userConfig.helpTextUnscramble =  '\n' +
            ( userConfig.trigger ) + 'word\n' +
            ( userConfig.trigger ) + 'newWord\n' +
            ( userConfig.trigger ) + 'define';





module.exports = userConfig;