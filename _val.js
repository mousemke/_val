

// Create the configuration
var userConfig = {
        friends             : [ 'nico', '_mouse_', 'arikedelstein' ],
        welcomingChannels   : [ '#microbe', '#the_unit' ],
        bots                : [ 'dante', 'zach', 'guillotine' ],
        admins              : [ '_mouse_' ],
        // channels            : [ '#soc-bots' ],
        channels            : [ '#soc-bots', '#microbe', '#sociomantic', '#the_unit', '#backend', '#_teamDoinStuff' ],
        server              : '192.168.2.24',
        botName             : '_val_00B5',
        trigger             : '.',
        dcAddress           : removed,
        api                 : removed,
        activeTime          : 600000,
        nickservBot         : 'NickServ',
        fettiLength         : 15,
        fettiOptions        : [ ' ', '. ', '´ ', '\' ', ' ,' ]
    },

    channel, _bot,

    channels    = userConfig.channels,
    // doge        = require( 'dogecoin' ),
    http        = require( 'http' ),
    https       = require( 'https' ),
    irc         = require( 'irc' ),
    fs          = require( 'fs' ),
    active      = {},
    moonRegex   = /(?:m([o]+)n)/,
    dcMasterList = {};

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
                                ( userConfig.trigger ) + 'innovation';


/**
 * API get
 *
 * gets and parses JSON from api sources
 *
 * @param  {str}                    _url                target url
 * @param  {func}                   _cb                 callback
 * @return {void}
 */
function apiGet( _url, _cb, secure )
{
    secure = ( secure === false ) ? false : true;

    var callback = function( res )
    {
        var body = '';

        res.on( 'data', function( chunk )
        {
            body += chunk;
        });

        res.on( 'end', function()
        {
            var data;
            try
            {
                data = JSON.parse( body );
                _cb( data );
            }
            catch( e )
            {
                console.log( _url + ' appears to be down' );
            }
        });

    };

    if ( secure )
    {
        https.get( _url, callback ).on( 'error', function( e )
        {
            console.log( 'Got error: ', e );
        });
    }
    else
    {
        http.get( _url, callback ).on( 'error', function( e )
        {
            console.log( 'Got error: ', e );
        });
    }
}


/**
 * Balance
 *
 * returns a users balance
 *
 * @param  {str}                    from                originating channel
 * @param  {str}                    to                  user
 * @param  {str}                    text                full message text
 *
 * @return {void}
 */
function balance( from, to, text )
{
    var _balanceCB = function( _to, _whois )
    {
        var amount      = dcMasterList[ _to ];
        amount          = ( amount ) ? amount : 0;

        var botText     = '';

        if ( from !== _to )
        {
            botText += _to + ', ';
        }

        botText += 'you currently have Ð' + amount;

        _bot.say( from, botText );
    };

    userData( to, from, _balanceCB );
}


/**
 * Check active
 *
 * returns a list of users that have posted within the defined amount of time
 *
 * @param  {str}                    from                originating channel
 * @param  {str}                    to                  originating user
 * @param  {str}                    text                full message text
 * @param  {bool}                   talk                true to say, otherwise
 *                                                      active only returns
 *
 * @return {arr}                                        active users
 */
function checkActive( from, to, text, talk )
{
    var name, now = Date.now(), i = 0,
        activeUsers = [],
        activeChannel = active[ from ];

    for ( name in activeChannel )
    {
        if ( now - userConfig.activeTime < activeChannel[ name ] )
        {
            i++;
            activeUsers.push( name );
        }
        else
        {
            delete activeChannel[ name ];
        }
    }

    if ( talk !== false )
    {
        botText = 'I see ' + i + ' active user';

        if ( i > 1 || i === 0 )
        {
            botText += 's';
        }

        botText += ' in ' + from;

        _bot.say( from, botText );
    }

    return activeUsers;
}


function deposit( from, to, text )
{
    // var _depositCB = function( from, _to, _info, _whois )
    // {
    //      var botText = '';
    //      if ( from !== _to )
    //      {
    //          botText += _to + ', ';
    //      }
    //
    //      botText += 'please deposit your Ð to ' + dcMasterList[ _whois.host ];
    //
    //     _bot.say( from, botText );
    // };

    // userData( from, to, _depositCB );
    //

    _bot.say( to, 'deposit and withdraw are in between APIs at the moment.  Ask _mouse_ for more info' );
}


/**
 * Dodge
 *
 * by stefan's request
 *
 * @param  {str}                    from                originating channel
 * @param  {str}                    to                  originating user
 *
 * @return {void}
 */
function dodge( from, to, text )
{
    var textSplit = text.split( ' ' );

    if ( textSplit[1] )
    {
        to = textSplit[1];
    }

    botText = ' hits ' + to + ' with a ';
    var car = cars[ Math.floor( Math.random() * cars.length ) ];

    if ( !car[ 1 ] )
    {
        botText += 'Dodge ' + car[ 0 ];
    }
    else if ( !car[ 2 ] )
    {
        botText += car[ 1 ] + ' Dodge ' + car[ 0 ];
    }
    else
    {
        var spread = car[ 2 ] - car[ 1 ];
        var year = Math.floor( Math.random() * spread ) + car[ 1 ];
        botText += year + ' Dodge ' + car[ 0 ];
    }

    _bot.action( from, botText );
}


/**
 * Doge
 *
 * returns satoshi value of 1 doge
 *
 * @param  {str}                    from                originating channel
 *
 * @return {void}
 */
function doge( from, text, full )
{
    var textSplit = text.split( ' ' );

    url = 'https://block.io/api/v1/get_current_price/?api_key=' + dcMasterList[ 'api-key' ];
    apiGet( url, function( info )
    {
        var price, dogePrices = info.data.prices,
            amount = parseInt( textSplit[ 1 ] );

        if ( typeof amount !== 'number' || isNaN( amount ) === true )
        {
            amount = 1;
        }

        var doge = '狗狗币!  Ð' + amount + ' =';

        if ( full === true )
        {
            doge += ' [ ';
        }
        else
        {
            doge += ' ';
        }

        for ( i = 0, lenI = dogePrices.length; i < lenI; i++ )
        {
            if ( ( dogePrices[ i ].price_base === 'BTC' &&
                 dogePrices[ i ].exchange === 'cryptsy' && full === false ) ||
                ( full === true ) )
            {
                price = dogePrices[ i ].price * amount;
                if ( dogePrices[ i ].price_base === 'BTC' && dogePrices[ i ].exchange === 'cryptsy' )
                {
                    price = Math.floor( price  * 100000000 );

                    if ( full === true )
                    {
                         price += ' (Satoshi), ';
                    }
                    else
                    {
                        price += ' satoshi';
                    }
                }
                else if ( dogePrices[ i ].price_base === 'USD' && dogePrices[ i ].exchange === 'cryptsy' )
                {
                    price = price + ' (' + ( dogePrices[ i ].price_base ) + '), ';
                }
                else if ( dogePrices[ i ].price_base !== 'BTC' && dogePrices[ i ].price_base !== 'USD' )
                {
                    price = price + ' (' + ( dogePrices[ i ].price_base ) + '), ';
                }
                else
                {
                    price = '';
                }

                doge += price;
            }
        }
        if ( full === false )
        {
            doge += '. TO THE MOON!!!!';
        }
        else
        {
            doge = doge.slice( 0, doge.length - 2 ) + ' ]';
        }

        _bot.say( from, doge );
    } );
}


/**
 * init
 *
 * sets listeners and master list up
 *
 * @return {void}
 */
function init()
{
    _bot = new irc.Client( userConfig.server, userConfig.botName, {
        channels: userConfig.channels
    });

    _bot.addListener( 'error', function( message )
    {
        console.log( 'error: ', message );
    });

    _bot.addListener( 'pm', listenToPm );

    for ( var i = 0, lenI = channels.length; i < lenI; i++ )
    {
        channel = channels[ i ];
        _bot.addListener( 'message' + channel, listenToMessages.bind( this, channels[ i ] ) );
    }

    loadMasterList();
}


/**
 * listen to messages
 *
 * .... what do you think?
 *
 *
 * @param  {[type]} from [description]
 * @param  {[type]} to   [description]
 * @param  {[type]} text [description]
 * @return {[type]}      [description]
 */
function listenToMessages( from, to, text )
{
    if ( userConfig.bots.indexOf( to ) === -1 )
    {
        if ( !active[ from ] )
        {
            active[ from ] = {};
        }
        active[ from ][ to ] = Date.now();

        var botText = '';
        command = text.slice( 1 ).split( ' ' )[ 0 ];
        var moon = moonRegex.exec( command );

        if ( text === '_val' || text === '_val?' )
        {
            _bot.say( from, 'yes?' );
        }
        else if ( text === 'is nico a bad man?' )
        {
            _bot.say( from, 'yes.  most definately' );
        }
        else if ( text[ 0 ] === userConfig.trigger && text !== userConfig.trigger )
        {
            switch ( command )
            {
                case 'rain':
                    botText = 'ヽ｀、ヽ｀ヽヽ｀、ヽ｀ヽヽ｀、ヽ｀ヽ(¬_¬ )ヽ｀、ヽ｀ヽ｀、ヽ｀';
                    break;
                case 'dance':
                    botText = '♪┏(・o･)┛♪┗ ( ･o･) ┓♪';
                    break;
                case 'domo':
                    botText = '\\|°▿▿▿▿°|/';
                    break;
                case 'barrelroll':
                    botText = '(._.)  ( l: )  ( .-. )  ( :l )  (._.)';
                    break;
                case 'hedgehog':
                    botText = '(•ᴥ• )́`́\'́`́\'́⻍ ';
                    break;
                case 'wave':
                    botText = to + ' o/';
                    break;
                case 'internet':
                    botText = 'ଘ(੭*ˊᵕˋ)੭* ̀ˋ ɪɴᴛᴇʀɴᴇᴛs';
                    break;
                case 'cornflakes':
                case 'snowflakes':
                    botText = '❅ ❆ ❄ ❆ ❆ ❄ ❆ ❅ ❆ ❆ ❅ ❆ ❄ ❄ ❅ ❄ ❆ ❆ ❆ ❄ ❆ ❆ ❄ ❆ ❆ ❅ ❅ ❄ ❄ ❅ ❄ ❄ ❄ ❆ ❄ ❅ ❆ ❅ ❅ ❄';
                    break;
                case 'whale':
                    botText = 'https://www.youtube.com/watch?v=xo2bVbDtiX8';
                    break;
                case 'bot':
                    botText = 'I AM BOT\nINSERT DOGE';
                    break;
                case 'google':
                    text = text.split( ' ' ).slice( 1 ).join( '%20' );
                    botText = 'http://www.lmgtfy.com/?q=' + text;
                    break;
                case 'g':
                    text = text.split( ' ' ).slice( 1 ).join( '%20' );
                    botText = 'https://www.google.com/search?btnG=1&pws=0&q=' + text + '&gws_rd=ssl';
                    break;
                case 'witchhunt':
                    botText = 'http://i.imgur.com/x63cdJW.jpg';
                    break;
                case 'innovation':
                    botText = 'INNOVATION!';
                    break;
                case 'ping':
                    botText = to + ': pong';
                    break;
                case 'doge':
                    doge( from, text, false );
                    break;
                case 'market':
                    doge( from, text, true );
                    break;
                case 'dodge':
                    dodge( from, to, text );
                    break;
                case 'tip':
                    tip( from, to, text );
                    break;
                case 'withdraw':
                    withdraw( from, to, text );
                    break;
                case 'balance':
                    balance( from, to, text );
                    break;
                case 'deposit':
                    deposit( from, to, text );
                    break;
                case 'active':
                    checkActive( from, to, text );
                    break;
                case 'soak':
                    soak( from, to, text );
                    break;
                case 'pool':
                    pool( from, to, text );
                    break;
                case 'help':
                    botText = userConfig.helpText;
                    if ( text.split( ' ' )[1] === '-v' )
                    {
                        botText += userConfig.helpTextSecondary;
                    }
                    _bot.say ( to, botText );
                    botText = '';
                    break;
                default:
                    botText = '';
            }

            if ( command.slice( command.length - 3 ) === 'end' )
            {
                var num = Math.floor( Math.random() * ( nouns.length ) );
                var noun = nouns[ num ];

                botText = command + 's ' + noun[ 0 ];

                var target = text.split( ' ' );

                if ( target && target[ 1 ] )
                {
                    var connections = [ ' to ', ' at ' ];
                    num = Math.floor( Math.random() * ( connections.length ) );
                    botText += connections[ num ] + target[ 1 ];
                }
                _bot.action( from, botText );
                botText = '';

            }
            else if ( command.slice( command.length - 5 ) === 'fetti' )
            {
                var type = command.slice( 0, command.length - 5 );
                var word = type;

                switch ( type )
                {
                    case 'doge':
                        word = 'wow';
                        break;
                    case 'con':
                        word = '´ . \'';
                        break;
                }

                if ( type.length > userConfig.fettiLength )
                {
                    word = 'toolong';
                }

                var option, options = userConfig.fettiOptions;
                options[ 0 ] = word + ' ';
                for ( i = 0; i < 25; i++ )
                {
                    option = Math.floor( Math.random() * options.length );
                    botText += options[ option ];
                }
            }
            else if ( moon && moon[1] )
            {
                botText = 'm';
                var moonLength = moon[1].length;
                for ( i = 0, lenI = moonLength; i < lenI; i++ )
                {
                    botText += 'ooo';
                }
                botText += 'n';

                if ( moonLength < 4 )
                {
                    botText = 'To the ' + botText + '!';
                }
                if ( moonLength > 6 )
                {
                    botText = botText.toUpperCase() + '!!!!!!!!';
                }
            }

            if ( botText !== '' )
            {
                _bot.say ( from, botText );
            }
        }
    }
    else if ( userConfig.bots.indexOf( to ) !== -1 &&
        ( ( text[ 0 ] === '.' && text !== '.' ) || ( text[ 0 ] + text[ 1 ] === '<<' ) ) )
    {
        _bot.say( from, 'nice try...' );
    }
}


function listenToPm( from, text )
{
    var textSplit = text.split( ' ' );
    if ( textSplit[ 0 ] === 'die' && userConfig.admins.indexOf( from ) !== -1 )
    {
        _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
        {
            console.log( from + ' killed me' );
        });
    }
    else if ( textSplit[ 0 ] === 'help' )
    {
        botText = userConfig.helpText;
        if ( textSplit[ 1 ] === '-v' )
        {
            botText += userConfig.helpTextSecondary;
        }
        _bot.say ( from, botText );
        botText = '';
    }
    else if ( textSplit[ 0 ] === 'doge' )
    {
        doge( from, text, false );
    }
    else if ( textSplit[ 0 ] === 'market' )
    {
        doge( from, text, true );
    }
    else if ( textSplit[ 0 ] === 'withdraw' )
    {
        withdraw( from, from, text );
    }
    else if ( textSplit[ 0 ] === 'balance' )
    {
        balance( from, from, text );
    }
    else if ( textSplit[ 0 ] === 'deposit' )
    {
        deposit( from, from, text );
    }
}


/**
 * Load Master List
 *
 * loads the json for the master bank list
 *
 * @return {void}
 */
function loadMasterList()
{
    var url = '/_val/dcMasterList.json';

    http.get( url, function( res )
    {
         var body = '', _json = '';

        res.on( 'data', function( chunk )
        {
            body += chunk;
        });

        res.on( 'end', function()
        {
            dcMasterList =  JSON.parse( body );
        });

    } ).on( 'error', function( e )
    {
        console.log( 'Got error: ', e );
    });
}


function pool( from, to, text )
{
    var botText, url = 'http://192.168.2.15:8001/api/players/',
        position    = [],
        textSplit   = text.split( ' ' ),
        wordOrNum   = parseInt( textSplit[ 1 ] ),
        count;

    if ( isNaN( wordOrNum ) && typeof textSplit[ 1 ] !== 'undefined' )
    {
        count = textSplit[ 1 ];
        url = 'http://192.168.2.15:8001/api/players/' + count;
    }
    else if ( typeof wordOrNum === 'number' )
    {
        count = wordOrNum;
    }

    if ( isNaN( count ) && typeof count !== 'string' )
    {
        count = 5;
    }

    if ( count !== 1 )
    {
        botText = 'the top ' + count + ' pool players in Sociomantic are:\n';
    }
    else
    {
        botText = 'the top pool player in Sociomantic is:\n';
    }

    apiGet( url, function( players )
    {
        if ( typeof count === 'number' )
        {
            for ( i = 0, lenI = players.length; i < lenI; i++ )
            {
                if ( ! position[ players[ i ].wins ] )
                {
                    position[ players[ i ].wins ] = [ players[ i ].name ];
                }
                else
                {
                    position[ players[ i ].wins ].push( players[ i ].name );
                }
            }

            for ( i = position.length - 1; i >= 0; i-- )
            {
                for ( j = 0, lenJ = position[ i ].length; j < lenJ; j++ )
                {
                    botText += position[ i ][ j ] + ' ' + i + ', ';

                    count--;
                    if ( count === 0 )
                    {
                        break;
                    }
                }
                 if ( count === 0 )
                {
                    break;
                }
            }

            if ( i === -1 || count === 0 )
            {
                botText = botText.slice( 0, botText.length - 2 );
                _bot.say( from, botText );
            }
        }
        else
        {
            if ( players.score )
            {
                botText = count + ' a ' + ( players._score ) + '% win rate. ( ' + ( players.wins ) + ':' + ( players.losses ) + ' )';
            }
            else if ( players.score === null || players.score === 0 )
            {
                botText = count + ' has never won a game. ( ' + ( players.wins ) + ':' + ( players.losses ) + ' )';
            }
            else
            {
                botText = 'are you sure that\'s an actual person?';
            }

            _bot.say( from, botText );
        }
    }, false );
}


/**
 * SOAK!
 *
 * takes a tip and splits it up between all active users
 *
 * @param  {[type]} from [description]
 * @param  {[type]} to   [description]
 * @param  {[type]} text [description]
 *
 * @return {[type]}      [description]
 */
function soak( from, to, text )
{
    var i, lenI;
    var list            = checkActive( from, to, text, false );
    var users           = list.length - 1;
    text                = text.split( ' ' );
    var soakTotal       = parseInt( text[1] );
    var soakAmount      = Math.floor( soakTotal / users );
    var soakRemainder   = soakTotal - ( soakAmount * users );


    var _soakCB = function( _to, _whois, textSplit, origText )
    {
        if ( dcMasterList[ to ] < soakTotal )
        {
            _bot.say( from, 'Sorry, ' + to + ', you need more doge' );
        }
        else if ( soakTotal < 1 )
        {
            _bot.say( from, 'Don\'t be so down, ' + to + '...  Stay positive!' );
        }
        else
        {
            if ( ! text[1] || typeof soakTotal !== 'number' || isNaN( soakTotal ) )
            {
                botText  = 'you must give an amount ( ' + ( userConfig.trigger ) + 'soak <amount> )';
            }
            else if ( users === 0 )
            {
                botText  = 'so, you just want to soak yourself then?';
            }
            else
            {
                if ( textSplit[ 3 ] === 'true' )
                {
                    if ( users !== 1 )
                    {
                        botText = 'Searching for active users....  ';

                        botText += to + ' tipped Ð' + text[1] + ' and is soaking ' + users +
                                ' people with Ð' + soakAmount + ' each! : ';

                        dcMasterList[ to ]  = dcMasterList[ to ] - soakTotal;

                        for ( i = 0, lenI = list.length; i < lenI; i++)
                        {
                            if ( list[ i ] !== to )
                            {
                                if ( dcMasterList[ list[ i ] ] )
                                {
                                    dcMasterList[ list[ i ] ] = dcMasterList[ list[ i ] ] + soakAmount;
                                }
                                else
                                {
                                    dcMasterList[ list[ i ] ] = soakAmount;
                                }
                                botText += list[ i ] + ', ';
                            }
                        }
                        botText = botText.slice( 0, botText.length - 2 );

                        if ( soakRemainder !== 0 )
                        {
                            dcMasterList[ userConfig.botName ] = dcMasterList[ userConfig.botName ] + soakRemainder;
                            botText += ' (Ð' + soakRemainder + ' in scraps eaten by ' + userConfig.botName + ')';
                        }
                    }
                    else
                    {
                        dcMasterList[ to ]  = dcMasterList[ to ] - soakTotal;
                        for ( i = 0; i < list.length; i++ )
                        {
                            if ( list[ i ] !== to )
                            {
                                dcMasterList[ list[ i ] ] = dcMasterList[ list[ i ] ] + soakAmount;
                                botText = to + ' tipped Ð' + text[1] + ' to ' + list[ i ];
                            }
                        }

                        botText += '. It\'s not soaking if there\'s just one person!';
                    }
                    writeMasterList();
                }
            else
            {
                botText = 'you must be identified to access your Doge (/msg ' + ( userConfig.nickservBot ) + ' help)';
            }

            _bot.say( from, botText );
            }
        }
    };

    userData( to, from, _soakCB, text );
}


function tip( from, to, text )
{
    var _tipCB = function( _to, _whois, textSplit, origText )
    {
        var origTextSplit = origText.split( ' ' );

        var reciever        = origTextSplit[ 1 ],
            amount          = origTextSplit[ 2 ],
            balance         = Math.floor( dcMasterList[ to ] );

        if ( ! reciever || ! amount || parseInt( amount ) != amount || isNaN( amount ) )
        {
            _bot.say( from, 'invalid tip syntax ( ' + ( userConfig.trigger ) + 'tip <user> <amount> )' );
        }
        else if ( balance < amount )
        {
            _bot.say( from, 'sorry ' + to + ', you need more Doge' );
        }
        else if ( amount < 1 )
        {
            _bot.say( from, 'stay positive, ' + to );
        }
        else if ( to === reciever )
        {
            _bot.say( from, 'don\'t tip yourself in public' );
        }
        else if ( amount < 1 )
        {
            _bot.say( from, 'sorry ' + to + ', you must send at least Ð1' );
        }
        else
        {
            if ( textSplit[ 3 ] === 'true' )
            {
                amount = parseInt( amount );

                dcMasterList[ to ]  = dcMasterList[ to ]  - amount;
                dcMasterList[ reciever ] = ( dcMasterList[ reciever ] ) ? dcMasterList[ reciever ] + amount : amount;
                writeMasterList();

                _bot.say( from, 'WOW! ' + to + ' tipped ' + reciever + ' such Ð' + amount + ' (to claim /msg ' + ( userConfig.botName ) + ' help)' );
            }
            else
            {
                _bot.say( from, 'you must be identified to access your Doge (/msg ' + ( userConfig.nickservBot ) + ' help)' );
            }
        }
    };

    userData( to, from, _tipCB, text );
}


function userData( to, from,  _cb, origText )
{
    var response = function( from, text )
    {
        _bot.removeListener( 'pm', response );

        textSplit = text.split( ' ' );

        if ( textSplit[ 0 ] === userConfig.api && textSplit[ 1 ] === 'identified' && textSplit[ 2 ] === to )
        {
            _cb( to, textSplit[ 3 ], textSplit, origText );
        }
        else if ( textSplit[ 0 ] === userConfig.api && textSplit[ 1 ] === 'notRegistered' && textSplit[ 2 ] === to )
        {
            _bot.say( to, 'You are not a registered user. (/msg NickServ help)' );
        }
        else
        {
            _bot.say( from, to + 'that\'s not an identified user' );
        }
    };

    _bot.addListener( 'pm', response );

    _bot.say( userConfig.nickservBot, userConfig.api + ' identified ' + to );
}


function withdraw( from, to, text )
{
    // var _withdrawCB = function( from, _to, _info, _whois )
    // {
    //     var textSplit           = text.split( ' ' ).slice( 1 );
    //     var _outgoingAddress    = textSplit[ 0 ];
    //     var balance             = Math.floor( _info.data.available_balance );
    //     var _sendAmount         = textSplit[ 1 ] || balance;

    //     if ( !_outgoingAddress ||
    //         _outgoingAddress.slice( 0, 1 ) !== 'D' ||
    //         _outgoingAddress.length !== 34 ||
    //         ( _sendAmount && parseInt( _sendAmount ) != _sendAmount ) )
    //     {
    //         _bot.say( from, 'invalid syntax. ' + ( userConfig.trigger ) + 'withdraw <address> [ <amount> ]' );
    //     }
    //     else if ( balance < _sendAmount )
    //     {
    //         _bot.say( from, 'sorry ' + ( to ) + ', you need more Doge' );
    //     }
    //     else if ( _sendAmount < 2 )
    //     {
    //         _bot.say( from, 'sorry ' + ( to ) + ', you must send at least Ð2' );
    //     }
    //     else
    //     {
    //         url = 'https://block.io/api/v1/withdraw_from_labels/?api_key=' + dcMasterList[ 'api-key' ] + '&from_labels=' + ( _whois.host ) + '&payment_address=' + _outgoingAddress + '&amount=' + _sendAmount + '&pin=' + ( userConfig.api );
    //         apiGet( url, function( info )
    //         {
    //             console.log( info, info.data, info.data.txid );
    //             _bot.say( from, 'Doge sent. https://dogechain.info/tx/' + info.data.txid );
    //         } );
    //     }
    // };

    // userData( fro from,m, to, _withdrawCB );

    _bot.say( to, 'deposit and withdraw are in between APIs at the moment.  Ask _mouse_ for more info' );
}


function writeMasterList()
{
    var jsonMasterList = JSON.stringify( dcMasterList );

    fs.writeFile( './dcMasterList.json', jsonMasterList, function ( err )
    {
        return console.log( err );
    });
}


dcMasterList = init();


var nouns = [
    [ 'a tornado.  It\'s an F5, and full of cows' ],
    [ 'an actor' ],
    [ 'actors' ],
    [ 'a columnist' ],
    [ 'a person' ],
    [ 'people' ],
    [ 'a pocket full of kryptonite' ],
    [ 'a question' ],
    [ 'questions unfit for human ponderings' ],
    [ 'a refrigerator' ],
    [ 'some refrigerators' ],
    [ 'a saw' ],
    [ 'saws' ],
    [ 'a scorpion' ],
    [ 'scorpions' ],
    [ 'a bobcat. Heh.  Look at him.' ],
    [ 'a box of bobcats' ],
    [ 'a cave with some lewd cave paintings' ],
    [ 'a cougar' ],
    [ 'some cougars' ],
    [ 'a root' ],
    [ 'a sneeze' ],
    [ 'a staircase' ],
    [ 'a tire' ],
    [ 'tires.  They are on fire.' ],
    [ 'a vase' ],
    [ 'Anthropology' ],
    [ 'a beard of bees' ],
    [ 'education' ],
    [ 'mustard' ],
    [ 'work' ],
    [ 'a Canoe.  It leaks slightly' ],
    [ 'Canoes, in a \'V\' formation' ],
    [ 'a Church' ],
    [ 'a fox' ],
    [ 'foxes' ],
    [ 'a harbor' ],
    [ 'Meat' ],
    [ 'an ophthalmologist' ],
    [ 'a beggar' ],
    [ 'a cello', 'noun' ],
    [ 'cellos', 'noun' ],
    [ 'a detective' ],
    [ 'an eyelash' ],
    [ 'Fear' ],
    [ 'your Grandfather' ],
    [ 'a lion' ],
    [ 'some lions' ],
    [ 'a radiator' ],
    [ 'a fishmonger' ],
    [ 'an adamantine wafer' ],
    [ 'a laptop from 1998' ],
    [ 'a Motorola Droid.  The screen is cracked.' ],
    [ 'a BANH MI sandwich' ],
    [ 'a bubble' ],
    [ 'a Nuka-Cola' ],
    [ 'a Jolt Cola' ],
    [ '99 Luftbaloons' ],
    [ '100 dogecoin paper coins' ],
    [ 'the 100th Luftballon. It\'s popped.....' ],
    [ 'a hot pocket' ],
    [ 'a can of Coca-Cola, filled with Pepsi' ],
    [ 'real food' ],
    [ 'some bratwurst' ],
    [ 'a classic NES' ],
    [ 'a broken bottle of maple syrup' ],
    [ 'ebola.  Walk it off.' ],
    [ 'a glass of sharkleberry fin kool-aid' ]
];

var coffees = [
    'a cup of cappuccino',
    'a cup of espresso',
    'a cup of French blend'
];

var cars = [
    [ '330', 1963, 1964 ],
    [ '400', 1982, 1983 ],
    [ '440', 1963, 1964 ],
    [ '600', 1983, 1988 ],
    [ '880', 1962, 1965 ],
    [ 'Aries', 1981, 1989 ],
    [ 'Aspen', 1976, 1980 ],
    [ 'Caliber', 2007, 2012 ],
    [ 'Challenger', 1970, 1974 ],
    [ 'Charger', 1966, 1977 ],
    [ 'Colt', 1971, 1994 ],
    [ 'Conquest', 1984, 1986 ],
    [ 'Coronet', 1949, 1959 ],
    [ 'Custom', 1946, 1948 ],
    [ 'Custom Royal', 1955, 1959 ],
    [ 'Daytona', 1984, 1993 ],
    [ 'Deluxe', 1946, 1948 ],
    [ 'Demon', 1960, 1976 ],
    [ 'Diplomat', 1977, 1989 ],
    [ 'Dynasty', 1988, 1993 ],
    [ 'Eight', 1930, 1933 ],
    [ 'Fast Four', 1927, 1928 ],
    [ 'Intrepid', 1993, 2004 ],
    [ 'Lancer', 1961, 1962 ],
    [ 'Magnum', 1978, 1979 ],
    [ 'Matador', 1960, null ],
    [ 'Meadowbrook', 1949, 1954 ],
    [ 'Mirada', 1980, 1983 ],
    [ 'Model 30', 1914, 1922 ],
    [ 'Monaco', 1965, 1978 ],
    [ 'Neon', 1995, 2005 ],
    [ 'Omni', 1978, 1990 ],
    [ 'Polara', 1960, 1973 ],
    [ 'Raider', 1987, 1989 ],
    [ 'Royal', 1954, 1959 ],
    [ 'Senior', 1927, 1930 ],
    [ 'Series 116', 1923, 1925 ],
    [ 'Series 126', 1926, 1927 ],
    [ 'Shadow', 1987, 1994 ],
    [ 'Sierra', 1957, 1959 ],
    [ 'Six', 1929, 1949 ],
    [ 'Spirit', 1989, 1995 ],
    [ 'Standard', 1928, 1929 ],
    [ 'Stealth', 1991, 1996 ],
    [ 'Stratus', 1995, 2006 ],
    [ 'St. Regis', 1979, 1981 ],
    [ 'Victory', 1928, 1929 ],
    [ 'Viper', null, null ],
    [ 'Venom', 1994, null ],
    [ 'Wayfarer', 1949, 1952 ],
    [ 'Durango', 1998, 2009 ],
    [ 'A100', 1964, 1970 ],
    [ 'D50', 1979,1993 ],
    [ 'Nitro', 2007, 2012 ],
    [ 'Raider', 1987, 1989 ],
    [ 'Ramcharger', 1974, 1993 ],
    [ 'Rampage', 1982, 1984 ],
    [ 'Ram Wagon', 1981, 2003 ],
    [ 'Route Van', 1948, 1959 ],
    [ 'Sprinter', 2003, 2009 ],
    [ 'Rumble Bee', 1960, 2014 ],
    [ '1500', 1973, 1978 ],
    [ '1800', 1973, 1981 ],
    [ 'Polara', 1973, 1981 ],
    [ 'Alpine',  1977, 1982 ],
    [ 'AT4', 1959, 1979 ],
    [ 'Coronet',  1978, 1982 ],
    [ 'Dart', 1970, 1981 ],
    [ '3700', 1971, 1978 ],
    [ 'Phoenix', 1960, 1973 ],
    [ 'Utility', 1967, 1976 ],
    [ 'Husky', null, null ],
    [ 'Crusader', 1951, 1958 ],
    [ 'Kingsway', 1946, 1952 ],
    [ 'Mayfair', 1953, 1959 ],
    [ 'Regent', 1946, 1959 ],
    [ 'Viscount', 1959, '' ]
];
