var http            = require( 'http' ),
    https           = require( 'https' ),
    irc             = require( 'irc' );
    fs              = require( 'fs' ),
    moonRegex       = /(?:m([o]+)n)/;

module.exports = function PlainText( _bot, apiGet, userData )
{
    return function( from, to, text, botText )
    {
        var command = text.slice( 1 ).split( ' ' )[ 0 ];
        var moon = moonRegex.exec( command );

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
            for ( var  i = 0; i < 25; i++ )
            {
                option = Math.floor( Math.random() * options.length );
                botText += options[ option ];
            }
        }
        else if ( moon && moon[1] )
        {
            botText = 'm';
            var moonLength = moon[1].length;
            for ( var j = 0; j < moonLength; j++ )
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
        else
        {
            switch ( command )
            {
                case 'konami':
                    botText = 'B A B A ↑ ↓ B A ← → B A (start)';
                    break;
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
            }
        }

        return botText;
    };
};