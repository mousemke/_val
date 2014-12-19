

// Create the configuration
var channel, _bot, doge, words,
    userConfig  = require( './config/_val.config.js' ),
    channels    = userConfig.channels,
    Doge        = require( './src/doge.js' ),
    Words       = require( './src/words.js' ),
    PlainText   = require( './src/plainText.js' ),
    Beats       = require( './src/beats.js' ),
    http        = require( 'http' ),
    https       = require( 'https' ),
    irc         = require( 'irc' ),
    fs          = require( 'fs' ),
    nouns       = require( './lists/nouns.js' ),
    coffees     = require( './lists/coffee.js' ),
    cars        = require( './lists/cars.js' );




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


function dogeResponses( from, to, text, botText )
{
    var command = text.slice( 1 ).split( ' ' )[ 0 ];

    switch ( command )
    {
        case 'doge':
            doge.doge( from, text, false );
            break;
        case 'market':
            doge.doge( from, text, true );
            break;
        case 'tip':
            doge.tip( from, to, text );
            break;
        case 'withdraw':
            doge.withdraw( from, to, text );
            break;
        case 'balance':
            doge.balance( from, to, text );
            break;
        case 'deposit':
            doge.deposit( from, to, text );
            break;
        case 'active':
            doge.checkActive( from, to, text );
            break;
        case 'soak':
            doge.soak( from, to, text );
            break;
    }

    return botText;
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
 * init
 *
 * sets listeners and master list up
 *
 * @return {void}
 */
function init()
{
    _bot = new irc.Client( userConfig.server, userConfig.botName, {
        channels    : userConfig.channels,
        password    : userConfig.serverPassword,
        showErrors  : false,
        autoRejoin  : true,
        autoConnect : true
        // debug       : true
    });

    _bot.addListener( 'error', function( message )
    {
        console.log( 'error: ', message );
    });

    _bot.addListener( 'pm', listenToPm );

    for ( var i = 0, lenI = channels.length; i < lenI; i++ )
    {
        channel = userConfig.channels[ i ];
        _bot.addListener( 'message' + channel, listenToMessages.bind( this, channels[ i ] ) );
    }

    doge        = new Doge( _bot, apiGet, userData, userConfig );
    doge.init();

    words       = new Words( _bot, apiGet, userData, userConfig, doge );
    words.init();

    plainText   = new PlainText( _bot, apiGet, userData, userConfig, nouns );

    beats       = new Beats( _bot, apiGet, userData, userConfig, nouns );
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
    if ( text.toLowerCase().indexOf( 'troll' ) !== -1 )
    {
        text = '.trollfetti';
    }
    else if ( text.toLowerCase().indexOf( 'trøll' ) !== -1 )
    {
        text = '.trøllfetti';
    }
    else if ( text.toLowerCase().indexOf( 'fight' ) !== -1 )
    {
        text = '.fight';
    }

    if ( userConfig.bots.indexOf( to ) === -1 )
    {
        var botText = '';

        if ( text === '_val' || text === '_val?' )
        {
            _bot.say( from, 'yes?' );
        }
        else if ( text === 'is nico a bad man?' )
        {
            _bot.say( from, 'yes.  most definitely' );
        }
        else if ( text[ 0 ] === userConfig.trigger && text !== userConfig.trigger )
        {
            botText = plainText( from, to, text, botText, nouns );

            if ( botText === '' )
            {
                botText = doge.responses( from, to, text, botText );
            }

            if ( botText === '' )
            {
                botText = words.responses( from, to, text, botText );
            }

            if ( botText === '' )
            {
                botText = beats( from, to, text, botText );
            }

            if ( botText === '' )
            {
                var command = text.slice( 1 ).split( ' ' )[ 0 ];

                switch ( command )
                {
                    case 'dodge':
                        dodge( from, to, text );
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
                        else if ( text.split( ' ' )[1] === 'unscramble' )
                        {
                            botText += userConfig.helpTextUnscramble;
                        }
                        _bot.say ( to, botText );
                        botText = '';
                        break;
                    default:
                        botText = '';
                }
            }

            if ( botText !== '' )
            {
                console.log( '<' + from + '> <' + to + '> :' + text );
                console.log( '<' + from + '> <' + userConfig.botName + '> :' + botText );
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
    console.log( '<' + from + '> :' + text );

    var textSplit = text.split( ' ' );
    if ( textSplit[ 0 ] === 'die' && userConfig.admins.indexOf( from ) !== -1 )
    {
        _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
        {
            console.log( from + ' killed me' );
        });
    }
    else if ( textSplit[ 0 ] === 'restart' && userConfig.admins.indexOf( from ) !== -1 )
    {
        _bot.say ( userConfig.unscramble, 'I will restart after the next word is skipped or solved' );
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
        doge.doge( from, text, false );
    }
    else if ( textSplit[ 0 ] === 'market' )
    {
        doge.doge( from, text, true );
    }
    else if ( textSplit[ 0 ] === 'withdraw' )
    {
        doge.withdraw( from, from, text );
    }
    else if ( textSplit[ 0 ] === 'balance' )
    {
        doge.balance( from, from, text );
    }
    else if ( textSplit[ 0 ] === 'deposit' )
    {
        doge.deposit( from, from, text );
    }
    else
    {
        words.responses( from, from, text, '' );
    }
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


init();
