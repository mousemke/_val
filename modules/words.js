
var copy = require( './i18n/words.i18n.js' );

module.exports  = function Words( _bot, _modules, userConfig, lang )
{
    lang = lang || 'en';

    var minLength   = 4,
    maxLength       = 8,
    currentWord     = '',
    currentWordTime = 0,
    currentWordDef  = '',
    englishWord     = '',
    scrambledWord   = '',
    wordScores      = {},
    wordListener, newWordVote = [],
    verboseDef      = false;

    var dogePayout      = userConfig.wordsDogePayout;
    var dogeModifier    = userConfig.wordsDogeModifier;
    var pointTimeout    = userConfig.wordsPointTimeout;

    var http            = userConfig.req.http;
    var https           = userConfig.req.https;
    var fs              = userConfig.req.fs;

    return {
        /**
         * ## buildPlayerPointsRequest
         *
         * builds the string to output a specific player's points
         *
         * @return _String_ new botText
         */
        buildPlayerPointsRequest : function( to, playerRequest, playerPoints )
        {
            var botText;

            if ( playerPoints )
            {
                if ( to === playerRequest )
                {
                    botText =  copy.youHavePoints[ lang ]( to, playerPoints );
                }
                else
                {
                    botText =  copy.theyHavePoints[ lang ]( to, playerRequest, playerPoints );
                }

                if ( playerPoints !== 1 )
                {
                    botText += copy.plural[ lang ];
                }
            }
            else
            {
                botText =  copy.nonplayer[ lang ]( to, playerRequest );
            }
        },


        /**
         * ## buildPointsList
         *
         * builds the string to output the points list
         *
         * @return _String_ new botText
         */
        buildPointsList : function( points )
        {
            var botText = copy.scoreHeader[ lang ];

            for ( var i = 0, lenI = points.length; i < lenI; i++ )
            {
                botText += ( i + 1 ) + ': ' + points[ i ].name + ' - ' + points[ i ].points + copy.points[ lang ];

                if ( points[ i ].points !== 1 )
                {
                    botText += copy.plural[ lang ];
                }
                botText += '\n';

                if ( i >= 9 )
                {
                    break;
                }
            }

            return botText;
        },


        /**
         * ## define
         *
         * grabs the definition of a word anf prints it
         *
         * @param {String} from originating channel
         * @param {String} word word to define
         * @param {Boolean} current current word or not
         * @param {String} to originating user
         *
         * @return _Void_
         */
        define : function( from, word, current, to )
        {
            var definition;

            word    = word.toLowerCase();
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
                            _def += copy.isNotAWord[ lang ];
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
         * ## ini
         *
         * reads the preexisting scores from json and gets an initial word
         *
         * @return _Void_
         */
        ini : function()
        {
            this.readScores();
            this.word();
        },


        /**
         * ## listenToWord
         *
         * listens to a word and reacts if someone needs a definition or
         * matches a word
         *
         * @param {String} word user input
         * @param {String} to originating user
         * @param {String} text full input string
         *
         * @return _Void_
         */
        listenToWord : function( word, to, text )
        {
            if ( verboseDef !== false && verboseDef[0] === to && text === '-def' )
            {
                this.showVerboseDef();
            }
            else if ( text.toLowerCase() === word.toLowerCase() )
            {
                var points, now = Date.now();

                if ( wordScores[ to ] )
                {
                    for ( var i = 0, lenI = wordScores[ to ].length; i < lenI; i++ )
                    {
                        if ( wordScores[ to ][ i ] < now - pointTimeout )
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
                var botText     = 'WOW ' + to + '! Such ' + points + copy.point[ lang ];
                if ( points !== 1 )
                {
                    botText += copy.plural[ lang ];
                }
                botText += '! Many ' + solveTime + copy.seconds[ lang ];

                if ( _modules.Doge && dogePayout )
                {
                    var dogetip = currentWord.length * dogeModifier;

                    _modules.Doge.giveFromBank( to, dogetip, true );
                    botText += copy.youveEarned[ lang ] + dogetip + '!';
                }

                var additionalDefs = currentWordDef.length - 1;

                if ( ! currentWordDef || ! currentWordDef[0] )
                {
                    currentWordDef = [ { text: copy.forgot[ lang ] } ];
                }

                botText += '\n' + currentWord + ': ';

                botText += englishWord && currentWord !== englishWord ?  englishWord + ': ' : '';
                botText += currentWordDef[0].text;

                if ( additionalDefs !== 0 )
                {
                    botText     += copy.additionalDefs[ lang ]( to, additionalDefs );
                    verboseDef  = [ to, currentWord, currentWordDef ];
                }
                else
                {
                    verboseDef      = false;
                }

                this.writeScores();
                _bot.say( userConfig.wordsChannel, botText );

                currentWord     = '';
                currentWordDef  = '';
                currentWordTime = '';
                newWordVote     = [];

                _bot.removeListener( 'message' + userConfig.wordsChannel, wordListener );
                this.word();
            }
        },


        /**
         * ## newWord
         *
         * registers votes, then starts the new word process when necessary
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         *
         * @return _Void_
         */
        newWord : function( from, to )
        {
            var active = _modules.core.checkActive( from, to, '', false );

            if ( newWordVote.indexOf( to ) === -1 )
            {
                newWordVote.push( to );
            }

            var votesNeeded = active.length * userConfig.newWordVoteNeeded;

            if ( newWordVote.length < votesNeeded )
            {
                _bot.say( userConfig.wordsChannel, to + copy.voteCounted[ lang ]( newWordVote ) + votesNeeded );
            }
            else
            {
                if ( currentWord !== '' )
                {
                    var _whatTheBotSay = copy.wordVotedOut[ lang ] + currentWord + ': ';
                    _whatTheBotSay += englishWord && currentWord !== englishWord ?  englishWord + ': ' : '';
                    _whatTheBotSay += currentWordDef[0].text;

                    _bot.say( userConfig.wordsChannel, _whatTheBotSay );
                    currentWord     = '';
                }

                currentWordTime = 0;
                scrambledWord   = '';
                newWordVote     = [];
                if ( wordListener )
                {
                    _bot.removeListener( 'message' + userConfig.wordsChannel, wordListener );
                }
                this.word();
            }
        },


        /**
         * ## processNewWord
         *
         * processes a new word grabbed from the api and does anything needed
         * to make it ready
         *
         * @param  {[type]} result [description]
         * @param  {String} to originating user
         *
         * @return _Void_
         */
        processNewWord : function( result, to )
        {
            currentWord         = result.word;
            var currentWordLength = currentWord.length;

            if ( currentWord[ currentWordLength - 1 ] === '.' )
            {
                currentWord.slice( currentWordLength - 1 );
            }

            currentWordTime = Date.now();
            this.define( userConfig.wordsChannel, currentWord, true, to );
            scrambledWord   = this.scramble( currentWord );
            _bot.say( userConfig.wordsChannel, copy.newWord[ lang ] + scrambledWord + ' (' + ( currentWord[0] ) + ')' );
            wordListener    = this.listenToWord.bind( this, result.word );
            _bot.addListener( 'message' + userConfig.wordsChannel, wordListener );
        },


        /**
         * ## readScores
         *
         * reads the scores from the json file
         *
         * @return _Void_
         */
        readScores : function()
        {
            var url = 'json/unscrambleScores.json';

            wordScores = JSON.parse( fs.readFileSync( url ) );
        },


        /**
         * words responses
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText )
        {
            if ( text[0] === userConfig.trigger )
            {
                text = text.slice( 1 );
            }

            var command = text.split( ' ' )[ 0 ];

            if ( from === userConfig.wordsChannel )
            {
                switch ( command )
                {
                    case copy.wordRes[ lang ]:
                        this.word( from, to );
                        break;
                    case copy.newWordRes[ lang ]:
                        this.newWord( from, to );
                        break;
                }
            }

            var complexTranslation = /[a-z]{2}\|[a-z]{2}/;
            if ( complexTranslation.test( command ) )
            {
                text = text.replace( command, '' ).trim();
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
                        this.define( from, text.split( ' ' ).slice( 1 ).join( '%20' ), to );
                        break;
                    case 'unscramble':
                        this.unscramble( from, to, text );
                        break;
                }
            }

            return botText;
        },


        /**
         * ## scramble
         *
         * scrambles a word
         *
         * @param {String} word word to scramble
         *
         * @return _Void_ scrambled word
         */
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


        /**
         * ## showVerboseDef
         *
         * shows the verbose definition to the last winner, then clears the listener
         *
         * @return _Void_
         */
        showVerboseDef : function()
        {
            var _def = verboseDef[1] + ' -\n';

            for ( var ii = 0, lenII = verboseDef[2].length; ii < lenII; ii++ )
            {
                _def += ( ii + 1 ) + ': ' + verboseDef[2][ ii ].text + '\n';
            }

            _bot.say( userConfig.wordsChannel, _def );

            verboseDef = false;
        },


        /**
         * ## translate
         *
         * translates a word from one language to another
         *
         * @param {String} langFrom language to translate from
         * @param {String} langTo language to translate to
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text original text
         * @param {Function} func callback function
         *
         * @return _Void_
         */
        translate : function( langFrom, langTo, from, to, text, func )
        {
            if ( text[0] === userConfig.trigger )
            {
                text = text.replace( ( userConfig.trigger ) + langTo, '' ).trim();
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


        /**
         * ## unscramble
         *
         * preps the scores and decides how best to display them
         *
         * @param  {[type]} from [description]
         * @param  {[type]} to   [description]
         * @param  {[type]} text [description]
         *
         * @return {[type]}      [description]
         */
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
                    playerPoints = wordScores[ player ].length;
                }

                var _obj = {
                    name    : player,
                    points  : wordScores[ player ].length
                };

                points.push( _obj );
            }

            points.sort( function( a, b )
            {
                return b.points - a.points;
            } );

            if ( playerRequest )
            {
                botText = this.buildPlayerPointsRequest( playerRequest, playerPoints )
            }
            else
            {
                botText = this.buildPointsList( points );
            }

            _bot.say( from, botText );
        },


        /**
         * ## writeScores
         *
         * writes the json score object to the file system
         *
         * @return _Void_
         */
        writeScores : function()
        {
            var wordScoresJson = JSON.stringify( wordScores );

            fs.writeFile( './json/unscrambleScores.json', wordScoresJson, function ( err )
            {
                return console.log( err );
            });
        },


        /**
         * ## word
         *
         * gets a new english word
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         *
         * @return _Void_
         */
        word : function( from, to )
        {
            if ( currentWord === '' )
            {
                var self = this;
                var excludeList = 'excludePartOfSpeech=affix&' +
                                    'excludePartOfSpeech=noun-plural&' +
                                    'excludePartOfSpeech=noun-possesive&' +
                                    'excludePartOfSpeech=given-name&' +
                                    'excludePartOfSpeech=family-name&' +
                                    'excludePartOfSpeech=suffix&' +
                                    'excludePartOfSpeech=proper-noun&' +
                                    'excludePartOfSpeech=idiom&' +
                                    'excludePartOfSpeech=phrasal-prefix&';

                var url =  ( userConfig.wordnikBaseUrl ) + 'words.json/randomWord?hasDictionaryDef=true&' + excludeList + 'minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=3&maxDictionaryCount=-1&minLength=' + minLength + '&maxLength=' + maxLength + '&api_key=' + userConfig.wordnikAPIKey;
                _modules.core.apiGet( url, function( result )
                {
                    if ( result.word[0] !== result.word[0].toLowerCase() ||
                            result.word.indexOf( '-' ) !== -1 ||
                            result.word.match( /^[a-zA-Z]+$/ ) === null )
                    {
                        self.word();
                    }
                    else
                    {
                        self.processNewWord.call( self, result, to );
                    }
                }, false, from, to );
            }
            else
            {
                _bot.say( userConfig.wordsChannel, copy.currentWord[ lang ] + scrambledWord.toLowerCase() + ' (' + ( currentWord[0].toLowerCase() ) + ')\n' );
            }
        }
    };
};
