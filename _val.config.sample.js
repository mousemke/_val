userConfig = {
    friends             : [ 'nico', '_mouse_', 'arikedelstein' ],
    bots                : [ 'dante', 'zach', 'guillotine' ],
    admins              : [ '_mouse_' ],
    // channels            : [ '#soc-bots' ],
    channels            : [ '#soc-bots', '#microbe', '#sociomantic', '#the_unit', '#backend', '#_teamDoinStuff', '#unscramble' ],
    server              : '192.168.2.24',
    botName             : 'justAnotherBot',
    trigger             : 'ß',
    dcAddress           : 'DDIHaveNoIdeaWhatImDoing',
    api                 : 'Help, I\'m trapped in an api factory',
    activeTime          : 600000,
    nickservBot         : 'NickServ',
    fettiWordLength     : 15,
    fettiLength         : 25,
    fettiOptions        : [ '. ', '´ ', '\' ', ' ,' ],
    unscramble          : '#unscramble'
};

userConfig.helpText    = 'Hi!  My name is ' + ( userConfig.botName ) + ', and I\'ll be your IRC bot for the evening.        \n' +
            'Valid commands are:     \n' +
            ( userConfig.trigger ) + 'help\n' +
            ( userConfig.trigger ) + 'doge\n' +
            ( userConfig.trigger ) + 'market\n' +
            ( userConfig.trigger ) + 'tip <user> <amount>\n' +
            ( userConfig.trigger ) + 'withdraw <address> [ <amount> ]  (costs a Ð1 transaction fee)   \n' +
            ( userConfig.trigger ) + 'deposit\n' +
            ( userConfig.trigger ) + 'balance\n' +
            ( userConfig.trigger ) + 'soak <amount>\n' +
            ( userConfig.trigger ) + 'active\n' +
            ( userConfig.trigger ) + 'google <query>\n' +
            ( userConfig.trigger ) + 'pool (<name or number>)\n' +
            '* market, doge, balance, withdraw, & deposit are also available as a pm';

userConfig.helpTextSecondary =  '\n' + ( userConfig.trigger ) + 'rain\n' +
                                ( userConfig.trigger ) + 'g <query>\n' +
                                ( userConfig.trigger ) + 'dance\n' +
                                ( userConfig.trigger ) + 'wave\n' +
                                ( userConfig.trigger ) + 'domo\n' +
                                ( userConfig.trigger ) + 'barrelroll\n' +
                                ( userConfig.trigger ) + 'hedgehog\n' +
                                ( userConfig.trigger ) + 'internet\n' +
                                ( userConfig.trigger ) + 'cornflakes\n' +
                                ( userConfig.trigger ) + 'snowflakes\n' +
                                ( userConfig.trigger ) + 'whale\n' +
                                ( userConfig.trigger ) + 'bot\n' +
                                ( userConfig.trigger ) + 'dodge\n' +
                                ( userConfig.trigger ) + 'ping\n' +
                                ( userConfig.trigger ) + 'witchhunt\n' +
                                ( userConfig.trigger ) + 'flipthetable\n' +
                                ( userConfig.trigger ) + 'chilloutbro\n' +
                                ( userConfig.trigger ) + 'putthetableback\n' +
                                ( userConfig.trigger ) + 'vampire\n' +
                                ( userConfig.trigger ) + 'innovation';

module.exports = userConfig;