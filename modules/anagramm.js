
module.exports  = function Anagram( _bot, _modules, userConfig )
{
    var minLength   = 4,
    maxLength       = 8,
    currentWord     = '',
    englishWord     = '',
    currentWordTime = 0,
    currentWordDef  = '',
    scrambledWord   = '',
    wordScores      = {},
    wordListener,
    newWordVote     = [],
    verboseDef      = false;

    var http            = userConfig.req.http;
    var https           = userConfig.req.https;
    var fs              = userConfig.req.fs;

    return {

        anagramm : function( from, to, text )
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
                        botText =  'Hallo ' + to + '! Du hast ' + playerPoints + ' Punkte';
                    }
                    else
                    {
                        botText =  'Moin ' + to + '! ' + playerRequest + ' hat ' + playerPoints + ' Punkte';
                    }

                    if ( playerPoints !== 1 )
                    {
                        botText += 's';
                    }
                }
                else
                {
                    botText =  'Hmm... ' + to + '... Ich glaube nicht, dass ' + playerRequest + ' ist eine reale Person';
                }
            }
            else
            {
                botText = 'Anagramm Punktzahl - \n';
                for ( var i = 0, lenI = points.length; i < lenI; i++ )
                {
                    botText += ( i + 1 ) + ': ' + points[ i ].name + ' - ' + points[ i ].points + ' Punkt';

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


        define : function( from, word, current, to )
        {
            var definition;

            word = word.toLowerCase();
            var url = ( userConfig.wordnikBaseUrl ) + 'word.json/' + word + '/definitions?includeRelated=true&useCanonical=true&includeTags=false&api_key=' + userConfig.wordnikAPIKey;

            if ( word === 'thoodle' )
            {
                _bot.say( from, 'thoodle-oo!!' );
            }
            else
            {
                _modules.core.apiGet( url, function( result )
                {
                    if ( current === true )
                    {
                        currentWordDef = result;
                    }
                    else
                    {
                        while ( word.indexOf( '%20' ) !== -1 )
                        {
                            word = word.replace( '%20', ' ' );
                        }

                        var _def = word;

                        if ( result.length === 0 )
                        {
                            _def += ' ist keine Wort.';
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

                }, false, from, to );
            }
        },


        /**
         * reads the preexisting scores from json and gets an initial word
         *
         * @return {void}
         */
        ini : function()
        {
            this.readScores();
            this.wort();
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

                _bot.say( userConfig.anagramm, _def );

                verboseDef = false;
            }
            else if ( text.toLowerCase() === word.toLowerCase() )
            {
                var points, now = Date.now();

                if ( wordScores[ to ] )
                {
                    for ( var i = 0, lenI = wordScores[ to ].length; i < lenI; i++ )
                    {
                        if ( wordScores[ to ][ i ] < now - userConfig.anagrammPointTimeout )
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

                var solveTime   = Math.floor( ( now - currentWordTime ) / 10 ) / 100;
                var botText     = 'WOW ' + to + '! Such ' + points + ' Punkte';
                if ( points !== 1 )
                {
                    botText += 's';
                }
                botText += '! Many ' + solveTime + ' Sekunden!';

                if ( _modules.doge && userConfig.anagrammDogePayout )
                {
                    var dogetip = currentWord.length * userConfig.anagrammDogeModifier;

                    _modules.doge.giveFromBank( to, dogetip, true );
                    botText += ' You\'ve earned Ð' + dogetip + '!';
                }

                var additionalDefs = currentWordDef.length - 1;

                if ( ! currentWordDef || ! currentWordDef[0] )
                {
                    currentWordDef = [ { text: 'ummm....    Keine Ahnung' } ];
                }

                botText += '\n' + currentWord + ': ' + englishWord + ': ' + currentWordDef[0].text;

                if ( additionalDefs !== 0 )
                {
                    botText += '\n (' + to + ' schlagen sie -def für ' + additionalDefs + ' weitere Definitionen)';
                    verboseDef      = [ to, currentWord, currentWordDef ];
                }
                else
                {
                    verboseDef      = false;
                }

                this.writeScores();
                _bot.say( userConfig.anagramm, botText );

                currentWord     = '';
                currentWordDef  = '';
                currentWordTime = '';
                newWordVote     = [];

                _bot.removeListener( 'message' + userConfig.anagramm, wordListener );
                this.wort();
            }
        },


        neuesWort : function( from, to )
        {
            var active =  _modules.core.checkActive( from, to, '', false );

            if ( newWordVote.indexOf( to ) === -1 )
            {
                newWordVote.push( to );
            }

            var votesNeeded = active.length * userConfig.newWordVoteNeeded;

            if ( newWordVote.length < votesNeeded )
            {
                _bot.say( userConfig.anagramm, to + ': festgestellt. Das ist ' + newWordVote.length + ' von ' + votesNeeded );
            }
            else
            {
                if ( currentWord !== '' )
                {
                    _bot.say( userConfig.anagramm, 'Das ist genug. Der Antwort war:\n' +
                                 currentWord + ': ' + englishWord + ': ' + currentWordDef[0].text );
                    currentWord     = '';
                }

                currentWordTime = 0;
                scrambledWord   = '';
                newWordVote     = [];
                if ( wordListener )
                {
                    _bot.removeListener( 'message' + userConfig.anagramm, wordListener );
                }
                this.wort();
            }
        },


        readScores : function()
        {
            var url = 'json/unscrambleScores.json';

            wordScores = JSON.parse( fs.readFileSync( url ) );
        },


        responses : function( from, to, text, botText )
        {
            if ( text[0] === userConfig.trigger )
            {
                text = text.slice( 1 );
            }

            var command = text.split( ' ' )[ 0 ];

            if ( from === userConfig.anagramm )
            {
                switch ( command )
                {
                    case 'wort':
                    case 'whirred':
                        this.wort( from, to );
                        break;
                    case 'neuesWort':
                        this.neuesWort( from, to );
                        break;
                }
            }

            switch ( command )
            {
                case 'anagramm':
                    this.anagramm( from, to, text );
                    break;
            }

            return botText;
        },


        scramble : function( word )
        {
            var originalWord = word;

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

            word = word.join( '' );

            return ( word === originalWord ) ? scramble( word ) : word;
        },


        translate : function( langFrom, langTo, from, to, text, func )
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

            var url = ( userConfig.translationBaseUrl ) + 'get?q=' + text + '&langpair=' + langFrom + '|' + langTo;

            _modules.core.apiGet( url, function( response )
            {
                var botText;
                response = response.matches;

                for ( var i = 0, lenI = response.length; i < lenI; i++ )
                {
                    if ( response[ i ].quality !== '0' )
                    {
                        botText = response[ i ].translation;
                        break;
                    }
                }

                if ( botText.indexOf( '|' ) !== -1 )
                {
                    botText = botText.split( '|' )[1].slice( 1 );
                }

                if ( from !== 'internal' )
                {
                    _bot.say( from, to + ': ' + langFrom + ' > ' + langTo + ' - ' + botText );
                }

                if ( func )
                {
                    func( botText );
                }
            }, false, from, to );
        },


        writeScores : function()
        {
            var wordScoresJson = JSON.stringify( wordScores );

            fs.writeFile( './json/unscrambleScores.json', wordScoresJson, function ( err )
            {
                return console.log( err );
            });
        },


        wort : function( from, to )
        {
            if ( currentWord === '' )
            {
                var scope       = this;
                var excludeList = 'excludePartOfSpeech=affix&' +
                                    'excludePartOfSpeech=noun-plural&' +
                                    'excludePartOfSpeech=noun-possesive&' +
                                    'excludePartOfSpeech=given-name&' +
                                    'excludePartOfSpeech=family-name&' +
                                    'excludePartOfSpeech=suffix&' +
                                    'excludePartOfSpeech=proper-noun&' +
                                    'excludePartOfSpeech=idiom&' +
                                    'excludePartOfSpeech=phrasal-prefix&';

                var url = ( userConfig.wordnikBaseUrl ) + 'words.json/randomWord?hasDictionaryDef=true&' + excludeList + 'minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=3&maxDictionaryCount=-1&minLength=' + minLength + '&maxLength=' + maxLength + '&api_key=' + userConfig.wordnikAPIKey;
                _modules.core.apiGet( url, function( result )
                {
                    if ( result.word[0] !== result.word[0].toLowerCase() ||
                            result.word.indexOf( '-' ) !== -1 ||
                            result.word.match( /^[a-zA-Z]+$/ ) === null )
                    {
                        scope.wort();
                    }
                    else
                    {
                        currentWord     = result.word.slice();
                        englishWord     = result.word;
                        currentWordTime = Date.now();
                        scope.define( userConfig.anagramm, currentWord, true, to );

                        scope.translate( 'en', 'de', 'internal', null, 'de ' + currentWord, function( translatedWord )
                        {
                            currentWord             = translatedWord;
                            var currentWordLength   = currentWord.length;

                            if ( currentWord[ currentWordLength - 1 ] === '.' )
                            {
                                currentWord.slice( currentWordLength - 1 );
                            }

                            scrambledWord   = scope.scramble( currentWord );

                            if ( currentWord.indexOf( '-' ) !== -1 ||
                            currentWord.indexOf( ' ' ) !== -1 ||
                            currentWord.toLowerCase() === englishWord )
                            {
                                currentWord = '';
                                scope.wort();
                            }
                            else
                            {
                                _bot.say( userConfig.anagramm, 'Der neue Anagramm ist: ' + scrambledWord.toLowerCase() + ' (' + ( currentWord[0].toLowerCase() ) + ')' );
                                wordListener    = scope.listenToWord.bind( scope, currentWord );
                                _bot.addListener( 'message' + userConfig.anagramm, wordListener );
                            }
                        } );
                    }
                }, false, from, to );
            }
            else
            {
                _bot.say( userConfig.anagramm, 'Das Anagramm ist: ' + scrambledWord.toLowerCase() + ' (' + ( currentWord[0].toLowerCase() ) + ')\n' );
            }
        }
    };
};
