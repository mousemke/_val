
/**
 * this is entirely filled with nonsense.  thats all the docs this needs.
 */
module.exports = function PlainText( _bot, _modules, userConfig, commandModule)
{
    var moonRegex       = /(?:m([o]+)n)/,
        spaceRegex      = /(?:sp([a]+)ce)/,
        khanRegex       = /(?:kh([a]+)n)/,

        /**
         * Lists
         */
        travolta        = require( '../lists/travolta.js' ),
        nouns           = require( '../lists/nouns.js' ),
        cars            = require( '../lists/cars.js' ),
        textResponses   = require( '../lists/plainText.js' );


    return {

        /**
         * ## dodge
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

            var botText = ` hits ${to} with a `;
            var car = cars[ Math.floor( Math.random() * cars.length ) ];

            if ( !car[ 1 ] )
            {
                botText += `Dodge ${car[ 0 ]}`;
            }
            else if ( !car[ 2 ] )
            {
                botText += `${car[ 1 ]} Dodge ${car[ 0 ]}`;
            }
            else
            {
                var spread = car[ 2 ] - car[ 1 ];
                var year = Math.floor( Math.random() * spread ) + car[ 1 ];
                botText += `${year} Dodge ${car[ 0 ]}`;
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
                case 'emergency':
                    word = [ '🚑 ', '🚨 ', '🚒 ', '🚓 ' ];
                    break;
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
         * ## responses
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         * @param {Object} confObj extra config object that some command modules need
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command, confObj )
        {
            var moon    = moonRegex.exec( command );
            var space   = spaceRegex.exec( command );
            var khan    = khanRegex.exec( command );

            if ( command.slice( command.length - 3 ) === 'end' )
            {
                return this.end( command, text );
            }
            else if ( command.slice( command.length - 5 ) === 'fetti' )
            {
                return this.fetti( command );
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
                  return `To the ${botText}!`;
                }
                if ( moonLength > 6 )
                {
                  return `${botText.toUpperCase()}!!!!!!!!`;
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

                return `${botText.toUpperCase()}!!!!!!`;
            }
            else if ( khan && khan[1] )
            {
                botText = 'kh';
                var khanLength = khan[1].length;
                for ( var l = 0, lenL = khanLength; l < lenL; l++ )
                {
                  botText += 'aa';
                }
                botText += 'n';

                return `${botText.toUpperCase()}!!!!!!`;
            }
            else
            {
                if ( !! textResponses[ command ] )
                {
                    return textResponses[ command ];
                }
                else
                {
                    switch ( command )
                    {
                        case 'dodge':
                            return this.dodge( from, to, text );

                        case 'travolta':
                            return this.travolta();

                        case 'dance':
                            var dancer = Math.floor( Math.random() * 80 );

                            if ( dancer === 3 )
                            {
                                return '└[∵┌]└[ ∵ ]┘[┐∵]┘';
                            }
                            else
                            {
                                return '♪┏(・o･)┛♪┗ ( ･o･) ┓♪';
                            }

                        case 'disappearinacloudofsmoke':
                            setTimeout( () =>
                            {
                                _bot.say( from, 'I mean...  why would you just assume you can have any new ability you want....', confObj );
                            }, 7500 );
                            setTimeout( () =>
                            {
                                _bot.say( from, 'ಠ_ಠ', confObj );
                            }, 1500 );

                            return 'no...  you don\'t have that ability.';

                        case 'bgg':
                            text = text.split( ' ' ).slice( 1 ).join( '+' );
                            return `http://www.boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${text}&B1=Go`;

                        case 'google':
                            text = text.split( ' ' ).slice( 1 ).join( '%20' );
                            return `http://www.lmgtfy.com/?q=${text}`;

                        case 'w':
                        case 'wiki':
                            text = text.split( ' ' ).slice( 1 ).join( '%20' );
                            return `http://en.wikipedia.org/wiki/${text}`;

                        case 'g':
                            text = text.split( ' ' ).slice( 1 ).join( '%20' );
                            return `https://www.google.de/search?hl=en&q=${text}`;

                        case 'badyoutube':
                        case 'germanysgottalent':
                            var choices = [ 'https://www.youtube.com/watch?v=IeWAPVWXLtM',
                                            'https://www.youtube.com/watch?v=dNUUCHsgRu8',
                                            'https://www.youtube.com/watch?v=PJQVlVHsFF8',
                                            'https://www.youtube.com/watch?v=xRVvegLwK_o'
                                            ];
                            var choice = Math.floor( Math.random() * choices.length );
                            return choices[ choice ];

                        case 'ping':
                            return to + ': pong';

                        case 'wave':
                            return to + ' o/';

                        case 'hug':
                            return 'No.';

                        case 'sleep':
                        case 'zzz':
                            return '(- o - ) zzZ ☽';

                    }
                }
             }

            return botText;
        },


        /**
         * ## travolta
         *
         * because
         *
         * @param  {str}                    from                originating channel
         * @param  {str}                    to                  originating user
         * @param  {str}                    text                message text
         *
         * @return {void}
         */
        travolta : function()
        {
            return travolta[ Math.floor( Math.random() * travolta.length ) ];
        }
    };
};