
/**
 * this is entirely filled with nonsense.  thats all the docs this needs.
 */
module.exports = function PlainText( _bot, _modules, userConfig )
{
    var moonRegex       = /(?:m([o]+)n)/,
        spaceRegex      = /(?:sp([a]+)ce)/,

        /**
         * Lists
         */
        nouns           = require( '../lists/nouns.js' ),
        cars            = require( '../lists/cars.js' );

    return {

        /**
         * Dodge
         *
         * by stefan's request
         *
         * @param  {str}                    from                originating channel
         * @param  {str}                    to                  originating user
         * @param  {str}                    text                message text
         *
         * @return {void}
         */
        dodge : function( from, to, text )
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

            return botText;
        },


        /**
         * Fetti!
         **/
        fetti : function( command )
        {
            var type = command.slice( 0, command.length - 5 );
            var word = type;

            switch ( type )
            {
                case 'doge':
                    word = [ 'wow ', 'Ð ', 'doge ', 'moon ', 'ÐÐÐ ', 'such ', 'is ' ];
                    break;
                case 'con':
                    word = '´ . \' ';
                    break;
                case 'spooky':
                    word = [ '\\༼☯༽/ ', '༼°°༽ ', 'SPOOKY ', 'GHOSTS ' ];
                    break;
                case 'moon':
                    word = [ 'moon ', 'moooooooon ', 'doge ', 'wow ' ];
                    break;
                case 'troll':
                    word = [ 'http://trololololololololololo.com/', 'http', 'trolo', 'lolo', 'ololo.com', 'troll'  ];
                    break;
                case 'trøll':
                    word = [ 'http://trølølølølølølølølølølø.cøm/', 'http', 'trølø', 'lølø', 'ølølø.cøm', 'trøll'  ];
                    break;
                case 'xmas':
                case 'christmas':
                    word = [ 'ʕ◔ᴥ◔ʔ ', '☃ ', 'presents ', '✦ ', 'santa ', '⁂ ', 'satan ' ];
                    break;
                case 'fork':
                    word = [ '--E ' ];
                    break;
                case 'fukt':
                    word = [ 'ا҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢ ', '⌒͝͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡ ' ];
                    break;
                case 'cone':
                    word = [ '/\\ ' ];
                    break;
            }

            if ( type.length > userConfig.fettiWordLength )
            {
                word = [ 'toolong' ];
            }

            if ( typeof word === 'string' )
            {
                word = [ word ];
            }

            var i, lenI, option;

            for ( i = 0, lenI = userConfig.fettiOptions.length; i < lenI; i++ )
            {
                word.push ( userConfig.fettiOptions[ i ] + ' ' );
            }

            var botText = '';

            for ( i = 0; i < userConfig.fettiLength; i++ )
            {
                option   = Math.floor( Math.random() * word.length );
                botText += word[ option ];
            }

            return botText;
        },


        /**
         *
         **/
        end : function( command, text )
        {
            var num     = Math.floor( Math.random() * ( nouns.length ) );
            var noun    = nouns[ num ];

            botText     = command + 's ' + noun[ 0 ];

            var target  = text.split( ' ' );

            if ( target && target[ 1 ] )
            {
              var connections = [ ' to ', ' at ' ];

              num = Math.floor( Math.random() * ( connections.length ) );
              botText += connections[ num ] + target[ 1 ];
            }

            return botText;
        },


        /**
         * Responses
         **/
        responses : function( from, to, text, botText )
        {
            var command = text.slice( 1 ).split( ' ' )[ 0 ];
            var moon    = moonRegex.exec( command );
            var space   = spaceRegex.exec( command );

            if ( command.slice( command.length - 3 ) === 'end' )
            {
                botText = this.end( command, text );
            }
            else if ( command.slice( command.length - 5 ) === 'fetti' )
            {
                botText = this.fetti( command );
            }
            else if ( moon && moon[1] && text !== '+moonflakes' )
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
            else if ( space && space[1] )
            {
                botText = 'sp';
                var spaceLength = space[1].length;
                for ( var k = 0, lenK = spaceLength; k < lenK; k++ )
                {
                  botText += 'aa';
                }
                botText += 'ce';
                botText = botText.toUpperCase() + '!!!!';
            }
            else
            {
                switch ( command )
                {
                    case 'dodge':
                        botText = this.dodge( from, to, text );
                        break;
                    case 'fight':
                        botText = '(ง︡\'-\'︠)ง';
                        break;
                    case 'levelSelect':
                        botText = 'B A B A ↑ ↓ B A ← → B A (start)';
                        break;
                    case 'konami':
                        botText = '↑ ↑ ↓ ↓ ← → ← → B A (start)';
                        break;
                    case 'rain':
                        botText = 'ヽ｀、ヽ｀ヽヽ｀、ヽ｀ヽヽ｀、ヽ｀ヽ(¬_¬ )ヽ｀、ヽ｀ヽ｀、ヽ｀';
                        break;
                    case 'dance':
                        var dancer = Math.floor( Math.random() * 80 );
                        if ( dancer === 3 )
                        {
                            botText = '└[∵┌]└[ ∵ ]┘[┐∵]┘';
                        }
                        else
                        {
                            botText = '♪┏(・o･)┛♪┗ ( ･o･) ┓♪';
                        }
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
                    case 'lurk':
                        botText = '┬┴┬┴┤(･_├┬┴┬┴';
                        break;
                    case 'lurkbear':
                        botText = '┬┴┬┴┤ʕ•ᴥ├┬┴┬┴';
                        break;
                    case 'wave':
                        botText = to + ' o/';
                        break;
                    case 'internet':
                        botText = 'ଘ(੭*ˊᵕˋ)੭* ̀ˋ ɪɴᴛᴇʀɴᴇᴛs';
                        break;
                    case 'cornflakes':
                    case 'snowflakes':
                        botText = '❅ ❆ ❆ ❆ ❆ ❅ ❆ ❆ ❅ ❆ ❅ ❆ ❆ ❆ ❆ ❆ ❆ ❆ ❅ ❅ ❅ ❆ ❅ ❆ ❅ ❅ ❆ ❅ ❆ ❅ ❆ ❆ ❆ ❆ ❆ ❆ ❆ ❆ ❆ ❆';
                        break;
                    case 'moonflakes':
                        botText = '☽ ❅ ❅ ❅ ☾ ❆ ❅ ☽ ❆ ❆ ☾ ❅ ☽ ☾ ❅ ❅ ☾ ❅ ☽ ☽ ❆ ☽ ❅ ❅ ☾ ☾ ❆ ☾ ❅ ☾ ☾ ❅ ❅ ☾ ❅ ☾ ❅ ❅ ☾ ❆';
                        break;
                    case 'whale':
                        botText = 'https://www.youtube.com/watch?v=xo2bVbDtiX8';
                        break;
                    case 'safety':
                        botText = 'https://www.youtube.com/watch?v=AjPau5QYtYs';
                        break;
                    case 'tacos':
                        botText = 'https://www.youtube.com/watch?v=W0-esOKooEE&index=28&list=RDHsKXvAymwUg';
                        break;
                    case 'shrug':
                        botText     = '¯\\_(ツ)_/¯';
                        break;
                    case 'yes!':
                        botText = '( ･ㅂ･)و ̑̑';
                        break;
                    case 'no!':
                        botText = '｡゜(｀Д´)゜｡';
                        break;
                    case 'why?!':
                        botText = 'ლ(ಠ_ಠლ)';
                        break;
                    case 'why!?':
                        botText = 'щ(ಥДಥщ)';
                        break;
                    case '...':
                        botText = 'ಠ_ಠ';
                        break;
                    case 'facepalm':
                        botText = '(－‸ლ)';
                        break;
                    case 'bot':
                        botText = 'I AM BOT\nINSERT DOGE';
                        break;
                    case 'disappearinacloudofsmoke':
                        setTimeout( function()
                            {
                                _bot.say( from, 'I mean...  why would you just assume you can have any new ability you want....' );
                            }, 5500 );
                        botText = 'no...  you don\'t have that ability.  stupid.';
                        break;
                    case 'google':
                        text = text.split( ' ' ).slice( 1 ).join( '%20' );
                        botText = 'http://www.lmgtfy.com/?q=' + text;
                        break;
                    case 'w':
                    case 'wiki':
                        text = text.split( ' ' ).slice( 1 ).join( '%20' );
                        botText = 'http://en.wikipedia.org/wiki/' + text;
                        break;
                    case 'g':
                    case 'pic':
                    case 'gif':
                        text = text.split( ' ' ).slice( 1 ).join( '%20' );
                        if ( command === 'gif' )
                        {
                            text += '%20filetype:gif';
                        }
                        botText = 'https://www.google.com/search?btnG=1&nfpr=1&pws=0&q=' + text;
                        if ( command === 'gif' || command === 'pic' )
                        {
                            botText += '&tbm=isch';
                        }
                        break;
                    case 'witchhunt':
                        botText = 'http://i.imgur.com/x63cdJW.jpg';
                        break;
                    case 'whichhunt':
                        botText = 'whichever';
                        break;
                    case 'wow':
                        botText = 'https://i.imgur.com/8rhlusE.gif';
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
                    case 'badyoutube':
                    case 'germanysgottalent':
                        var choices = [ 'https://www.youtube.com/watch?v=IeWAPVWXLtM',
                                        'https://www.youtube.com/watch?v=dNUUCHsgRu8',
                                        'https://www.youtube.com/watch?v=PJQVlVHsFF8'
                                        ];
                        var choice = Math.floor( Math.random() * choices.length );
                        botText = choices[ choice ];
                        break;
                    case 'magic':
                        botText = '∴•:+*⁽⁽ଘ( ˊᵕˋ )ଓ⁾⁾*+:•*∴';
                        break;
                    case 'pacman':
                        botText = '( *<)  • • • • • • •';
                        break;
                }
             }

            return botText;
        }
    };
};