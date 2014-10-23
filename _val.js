

// Create the configuration
var userConfig = require( './_val.config.js' ),

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

    var botText = ' hits ' + to + ' with a ';
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

    var url = 'https://block.io/api/v1/get_current_price/?api_key=' + dcMasterList[ 'api-key' ];
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

        for ( var i = 0, lenI = dogePrices.length; i < lenI; i++ )
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
        var command = text.slice( 1 ).split( ' ' )[ 0 ];
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
                case 'flipthetable':
                    botText = '(╯°□°）╯︵ ┻━┻';
                    break;
                case 'chilloutbro':
                case 'putthetableback':
                    botText = '┬──┬ ノ( ゜-゜ノ)';
                    break;
                case 'vampire':
                    botText = '(°,..,°)';
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
                for (var  i = 0; i < 25; i++ )
                {
                    option = Math.floor( Math.random() * options.length );
                    botText += options[ option ];
                }
            }
            else if ( moon && moon[1] )
            {
                botText = 'm';
                var moonLength = moon[1].length;
                for ( i = 0; i < moonLength; i++ )
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
    var botText, url = 'http://192.168.2.15:8001/api/players',
        textSplit   = text.split( ' ' ),
        wordOrNum   = parseInt( textSplit[ 1 ], 10 ),
        count;

    if ( isNaN( wordOrNum ) && typeof textSplit[ 1 ] !== 'undefined' )
    {
        count = textSplit[ 1 ];
        url += '/' + count;
    }
    else
    {
        count = isNaN( wordOrNum ) ? 5 : wordOrNum;
        url += '?sort=desc&limit=' + count;
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
        var player;
        if ( typeof count === 'number' )
        {
            var rank = 1;

            for ( var i = 0, length = players.length; i < length; i++ )
            {
                player = players[i];

                botText += (rank++) + ' - ' + player.name + ' (' +
                            player.wins  + ':' + player.losses + ')';

                if ( i < length - 1 )
                {
                    botText += ', ';
                }
            }

            _bot.say( from, botText );
        }
        else if ( typeof count === 'string' )
        {
            player = players;
            if ( player.score )
            {
                botText = count + ' a ' + ( player._score ) + '% win rate. ( ' + ( player.wins ) + ':' + ( player.losses ) + ' )';
            }
            else if ( player.score === null || player.score === 0 )
            {
                botText = count + ' has never won a game. ( ' + ( player.wins ) + ':' + ( player.losses ) + ' )';
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
                _bot.say( reciever,   'Such ' + to + ' tipped you Ð' + amount + ' (to claim /msg ' + ( userConfig.botName ) + ' help)' );
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


var nouns = require( './lists/nouns.js' );

var coffees = require( './lists/coffee.js' );

var cars = require( './lists/cars.js' );
