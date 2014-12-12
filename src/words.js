var wordnikAPIKey   = '2b79afb305c66bf9bf00f026b7a02f49e85b963364a580810',
    http            = require( 'http' ),
    https           = require( 'https' ),
    minLength       = 4,
    maxLength       = 8,
    currentWord     = '',
    currentWordDef  = '',
    scrambledWord   = '',
    wordScores      = {},
    wordListener, newWordVote = [],
    verboseDef      = false;

module.exports  = function Words( _bot, apiGet, userData, userConfig, doge )
{
    return {


        define : function( from, word, current )
        {
            var definition;

            word = word.toLowerCase();

            var url = 'http://api.wordnik.com:80/v4/word.json/' + word + '/definitions?includeRelated=true&useCanonical=true&includeTags=false&api_key=' + wordnikAPIKey;
            apiGet( url, function( result )
            {
                if ( current === true )
                {
                    currentWordDef = result;
                }
                else
                {
                    var spaceRegex = new RegExp( /%20/, 'g' );
                    var _def = word.replace( spaceRegex, ' ' );

                    if ( result.length === 0 )
                    {
                        _def += ' is, sadly, not a word.';
                    }
                    else
                    {
                        _def += ' -\n';
                        for ( var i = 0, lenI = result.length; i < lenI; i++ )
                        {
                            _def += ( i + 1 ) + ': ' + result[ i ].text + '\n';
                        }
                    }

                    _bot.say( from, _def );
                }

            }, false );
        },


        init : function()
        {
            this.readScores();
            this.word();
        },


        listenToWord : function( word, to, text )
        {
            if ( verboseDef !== false && verboseDef[0] === to && text === '-def' )
            {
                var _def = verboseDef[1] + ' -\n';

                for ( var ii = 0, lenII = verboseDef[2].length; ii < lenII; ii++ )
                {
                    _def += ( ii + 1 ) + ': ' + verboseDef[2][ ii ].text + '\n';
                }

                _bot.say( userConfig.unscramble, _def );

                verboseDef = false;
            }
            else if ( text.toLowerCase() === word.toLowerCase() )
            {
                var points, now = Date.now();

                if ( wordScores[ to ] )
                {
                    for ( var i = 0, lenI = wordScores[ to ].length; i < lenI; i++ )
                    {
                        if ( wordScores[ to ][ i ] < now - userConfig.unscramblePointTimeout )
                        {
                            wordScores[ to ].splice( i, 1 );
                        }
                    }

                    wordScores[ to ].push( now );
                }
                else
                {
                    wordScores[ to ] = [ now ];
                }

                points = wordScores[ to ].length;
                var botText = 'Good Job ' + to + '! you now have ' + points + ' point';
                if ( points !== 1 )
                {
                    botText += 's';
                }
                var additionalDefs = currentWordDef.length - 1;
                botText += '\n' + currentWord + ': ' + currentWordDef[0].text;
                if ( additionalDefs !== 0 )
                {
                    botText += '\n (' + to + ' hit -def for ' + additionalDefs + ' more definitions)';
                    verboseDef      = [ to, currentWord, currentWordDef ];
                }
                else
                {
                    verboseDef      = false;
                }

                this.writeScores();
                _bot.say( userConfig.unscramble, botText );

                currentWord     = '';
                currentWordDef  = '';
                newWordVote     = [];
                //doge tip per length?
                _bot.removeListener( 'message' + userConfig.unscramble, wordListener );
                this.word();
            }
        },


        newWord : function( from, to )
        {
            var active =  doge.checkActive( from, to, '', false );

            if ( newWordVote.indexOf( to ) !== -1 )
            {
                _bot.say( userConfig.unscramble, 'Sorry, ' + to + ', you\'ve already voted' );
                return false;
            }
            else
            {
                newWordVote.push( to );

                var votesNeeded = active.length * userConfig.newWordVoteNeeded;

                if ( newWordVote.length < votesNeeded )
                {
                    _bot.say( userConfig.unscramble, to + ': counted. that\'s ' + newWordVote.length + ' out of a necessary ' + votesNeeded );
                }
                else
                {
                    if ( currentWord !== '' )
                    {
                        _bot.say( userConfig.unscramble, 'that\'s enough votes. The correct answer was:\n' +
                                     currentWord + ' - ' + currentWordDef[0].text );
                        currentWord     = '';
                    }

                    scrambledWord   = '';
                    newWordVote     = [];
                    _bot.removeListener( 'message' + userConfig.unscramble, wordListener );
                    this.word();
                }
            }
        },


        readScores : function()
        {
            var url = '/_val/json/unscrambleScores.json';

            http.get( url, function( res )
            {
                 var body = '';

                res.on( 'data', function( chunk )
                {
                    body += chunk;
                });

                res.on( 'end', function()
                {
                    wordScores =  JSON.parse( body );
                });

            } ).on( 'error', function( e )
            {
                console.log( 'Got error: ', e );
            });
        },


        responses : function( from, to, text, botText )
        {
            if ( text[0] === '.' )
            {
                text = text.slice( 1 );
            }

            var command = text.split( ' ' )[ 0 ];

            if ( from === userConfig.unscramble )
            {
                switch ( command )
                {
                    case 'word':
                    case 'whirred':
                        this.word( from, text, false );
                        break;
                    case 'newWord':
                        this.newWord( from, to );
                        break;
                }
            }

            var complexTranslation = /[a-z]{2}\|[a-z]{2}/;
            if ( complexTranslation.test( command ) )
            {
                console.log( command );
                text = text.replace( command, '' ).trim();
                console.log( text );
                command = command.split( '|' );
                this.translate( command[0], command[1], from, to, text );
            }
            else
            {
                switch ( command )
                {
                    case 'aa':
                    case 'af':
                    case 'an':
                    case 'ay':
                    case 'ar':
                    case 'bs':
                    case 'ca':
                    case 'ce':
                    case 'ch':
                    case 'co':
                    case 'cs':
                    case 'da':
                    case 'de':
                    case 'dv':
                    case 'el':
                    case 'eo':
                    case 'es':
                    case 'et':
                    case 'eu':
                    case 'fi':
                    case 'fj':
                    case 'fo':
                    case 'fr':
                    case 'gl':
                    case 'he':
                    case 'ho':
                    case 'hr':
                    case 'hy':
                    case 'id':
                    case 'it':
                    case 'is':
                    case 'ja':
                    case 'jv':
                    case 'ky':
                    case 'km':
                    case 'ko':
                    case 'la':
                    case 'lo':
                    case 'lt':
                    case 'lv':
                    case 'mg':
                    case 'mo':
                    case 'ms':
                    case 'ne':
                    case 'nl':
                    case 'no':
                    case 'os':
                    case 'pl':
                    case 'pt':
                    case 'qu':
                    case 'ro':
                    case 'ru':
                    case 'sc':
                    case 'si':
                    case 'sl':
                    case 'sm':
                    case 'so':
                    case 'sq':
                    case 'su':
                    case 'sv':
                    case 'tl':
                    case 'tr':
                    case 'ug':
                    case 'uk':
                    case 'vi':
                    case 'yi':
                    case 'zh':
                    case 'zu':
                        this.translate( 'en', command, from, to, text );
                        break;
                    case 'def':
                    case 'define':
                        this.define( from, text.split( ' ' ).slice( 1 ).join( '%20' ) );
                        break;
                    case 'unscramble':
                        this.unscramble( from, to, text );
                        break;
                }
            }

            return botText;
        },


        scramble : function( word )
        {
            word = word.split( '' );
            var currentIndex = word.length, temporaryValue, randomIndex ;

            while ( currentIndex !== 0)
            {
                randomIndex = Math.floor( Math.random() * currentIndex );
                currentIndex--;

                temporaryValue         = word[ currentIndex ];
                word[  currentIndex ]  = word[ randomIndex ];
                word[  randomIndex ]   = temporaryValue;
            }

            return word.join( '' );
        },


        translate : function( langFrom, langTo, from, to, text )
        {

            if ( text[0] === '.' )
            {
                text = text.replace( '.' + langTo, '' ).trim();
            }
            else
            {
                text = text.replace( langTo, '' ).trim();
            }

            text = encodeURIComponent( text );

            var url = 'http://mymemory.translated.net/api/get?q=' + text + '&langpair=' + langFrom + '|' + langTo;

            apiGet( url, function( response )
            {
                var botText    = response.responseData.translatedText;
                if ( botText.indexOf( '|' ) !== -1 )
                {
                    botText = botText.split( '|' )[1].slice( 1 );
                }

                _bot.say( from, to + ': ' + langFrom + ' > ' + langTo + ' - ' + botText );
            }, false );
        },


        unscramble : function( from, to, text )
        {
            this.readScores();

            var points = [];
            var playerPoints;
            var botText;
            var playerRequest = text.split( ' ' )[1];

            for ( var player in wordScores )
            {
                if ( player === playerRequest )
                {
                    playerPoints = wordScores[player].length;
                }

                var _obj = {
                    name    : player,
                    points  : wordScores[player].length
                };

                points.push( _obj );
            }

            points.sort( function( a, b )
            {
                return b.points - a.points;
            } );

            if ( playerRequest )
            {
                if ( playerPoints )
                {
                    if ( to === playerRequest )
                    {
                        botText =  'Hey ' + to + '! You have ' + playerPoints + ' point';
                    }
                    else
                    {
                        botText =  'Why hello ' + to + '! ' + playerRequest + ' has ' + playerPoints + ' point';
                    }

                    if ( playerPoints !== 1 )
                    {
                        botText += 's';
                    }
                }
                else
                {
                    botText =  'Well... ' + to + '... I don\'t think ' + playerRequest + ' is a real person';
                }
            }
            else
            {
                botText = 'Unscramble Scores - \n';
                for ( var i = 0, lenI = points.length; i < lenI; i++ )
                {
                    botText += ( i + 1 ) + ': ' + points[ i ].name + ' - ' + points[ i ].points + ' point';

                    if ( points[ i ].points !== 1 )
                    {
                        botText += 's';
                    }
                    botText += '\n';

                    if ( i >= 9 )
                    {
                        break;
                    }
                }
            }
             _bot.say( from, botText );
        },


        writeScores : function()
        {
            var wordScoresJson = JSON.stringify( wordScores );

            fs.writeFile( './json/unscrambleScores.json', wordScoresJson, function ( err )
            {
                return console.log( err );
            });
        },


        word : function()
        {
            if ( currentWord === '' )
            {
                var scope = this;
                var excludeList = 'excludePartOfSpeech=affix&' +
                                    'excludePartOfSpeech=noun-plural&' +
                                    'excludePartOfSpeech=noun-possesive&' +
                                    'excludePartOfSpeech=given-name&' +
                                    'excludePartOfSpeech=family-name&' +
                                    'excludePartOfSpeech=suffix&' +
                                    'excludePartOfSpeech=proper-noun&' +
                                    'excludePartOfSpeech=idiom&' +
                                    'excludePartOfSpeech=phrasal-prefix&';

                var url = 'http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&' + excludeList + 'minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=3&maxDictionaryCount=-1&minLength=' + minLength + '&maxLength=' + maxLength + '&api_key=' + wordnikAPIKey;
                apiGet( url, function( result )
                {
                    if ( result.word[0] !== result.word[0].toLowerCase() || result.word.indexOf( '-' ) !== -1 )
                    {
                        scope.word();
                    }
                    else
                    {
                        currentWord     = result.word;
                        scope.define( userConfig.unscramble, currentWord, true );
                        scrambledWord   = scope.scramble( currentWord );
                        _bot.say( userConfig.unscramble, 'The new scramble word is: ' + scrambledWord + ' (' + ( currentWord[0] ) + ')' );
                        wordListener    = scope.listenToWord.bind( scope, result.word );
                        _bot.addListener( 'message' + userConfig.unscramble, wordListener );
                    }
                }, false);
            }
            else
            {
                _bot.say( userConfig.unscramble, 'The current scramble word is: ' + scrambledWord + ' (' + ( currentWord[0] ) + ')' );
            }
        }
    };
};
