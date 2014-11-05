var wordnikAPIKey   = '2b79afb305c66bf9bf00f026b7a02f49e85b963364a580810',
    http            = require( 'http' ),
    https           = require( 'https' ),
    minLength       = 4,
    maxLength       = 8,
    currentWord     = '',
    currentWordDef  = '',
    scrambledWord   = '',
    wordScores      = {},
    wordListener, newWordVote = [];

module.exports  = function Words( _bot, apiGet, userData, userConfig, doge )
{
    return {

        init : function()
        {
            this.readScores();
            this.word();
        },


        define : function( from, word, current )
        {
            var definition;

            var url = 'http://api.wordnik.com:80/v4/word.json/' + word.toLowerCase() + '/definitions?limit=1&includeRelated=true&useCanonical=true&includeTags=false&api_key=' + wordnikAPIKey;
            apiGet( url, function( result )
            {
                if ( current === true )
                {
                    currentWordDef = result[0].text;
                }
                else
                {
                    _bot.say( from, word + ': ' + result[0].text );
                }

            }, false );
        },


        listenToWord : function( word, to, text )
        {
            if ( text.toLowerCase() === word.toLowerCase() )
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
                botText += '\n' + currentWord + ': ' + currentWordDef;

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
                                     currentWord + ' - ' + currentWordDef );
                        currentWord     = '';
                    }

                    scrambledWord   = '';
                    newWordVote     = [];
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

            var command = text.slice( 1 ).split( ' ' )[ 0 ];

            if ( from === userConfig.unscramble )
            {
                switch ( command )
                {
                    case 'word':
                        this.word( from, text, false );
                        break;
                    case 'newWord':
                        this.newWord( from, to );
                        break;
                }
            }

            switch ( command )
            {
                case 'def':
                case 'define':
                    this.define( from, text.split( ' ' )[ 1 ] );
                    break;
                case 'unscramble':
                    this.unscramble( from, to, text );
                    break;
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


        unscramble : function( from, to, text )
        {
            _bot.say( from, 'hello, ' + to + ', this would be your score if it was built' );
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
