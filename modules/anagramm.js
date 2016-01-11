



module.exports  = function Anagram( _bot, _modules, userConfig )
{
    let  lang = 'de';

    let minLength   = 4,
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

    let http            = userConfig.req.http;
    let https           = userConfig.req.https;
    let fs              = userConfig.req.fs;

    let processNewWord = function( self, result )
    {
        currentWord     = result.word.slice();
        englishWord     = result.word;
        currentWordTime = Date.now();
        self.define( userConfig.anagramm, currentWord, true, to );

        self.translate( 'en', 'de', 'internal', null, 'de ' + currentWord, function( translatedWord )
        {
            currentWord             = translatedWord;
            let currentWordLength   = currentWord.length;

            if ( currentWord[ currentWordLength - 1 ] === '.' )
            {
                currentWord.slice( currentWordLength - 1 );
            }

            scrambledWord   = self.scramble( currentWord );

            if ( currentWord.indexOf( '-' ) !== -1 ||
            currentWord.indexOf( ' ' ) !== -1 ||
            currentWord.toLowerCase() === englishWord )
            {
                currentWord = '';
                self.wort();
            }
            else
            {
                _bot.say( userConfig.anagramm, copy.newWord[ lang ] + scrambledWord.toLowerCase() + ' (' + ( currentWord[0].toLowerCase() ) + ')' );
                wordListener    = self.listenToWord.bind( self, currentWord );
                _bot.addListener( 'message' + userConfig.anagramm, wordListener );
            }
        } );
    };


    return {

        anagramm : function( from, to, text )
        {
            this.readScores();

            let points = [];
            let playerPoints;
            let botText;
            let playerRequest = text.split( ' ' )[1];

            for ( let player in wordScores )
            {
                if ( player === playerRequest )
                {
                    playerPoints = wordScores[player].length;
                }

                let _obj = {
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
            }
            else
            {
                botText = copy.scoreHeader[ lang ];
                for ( let i = 0, lenI = points.length; i < lenI; i++ )
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


        // define : function( from, word, current, to )
        // {
        //     let definition;

        //     word = word.toLowerCase();
        //     let url = ( userConfig.wordnikBaseUrl ) + 'word.json/' + word + '/definitions?includeRelated=true&useCanonical=true&includeTags=false&api_key=' + userConfig.wordnikAPIKey;

        //     if ( word === 'thoodle' )
        //     {
        //         _bot.say( from, 'thoodle-oo!!' );
        //     }
        //     else
        //     {
        //         _modules.core.apiGet( url, function( result )
        //         {
        //             if ( current === true )
        //             {
        //                 currentWordDef = result;
        //             }
        //             else
        //             {
        //                 while ( word.indexOf( '%20' ) !== -1 )
        //                 {
        //                     word = word.replace( '%20', ' ' );
        //                 }

        //                 let _def = word;

        //                 if ( result.length === 0 )
        //                 {
        //                     _def += copy.isNotAWord[ lang ];
        //                 }
        //                 else
        //                 {
        //                     _def += ' -\n';
        //                     for ( let i = 0, lenI = result.length; i < lenI; i++ )
        //                     {
        //                         _def += ( i + 1 ) + ': ' + result[ i ].text + '\n';
        //                     }
        //                 }

        //                 _bot.say( from, _def );
        //             }

        //         }, false, from, to );
        //     }
        // },


        /**
         * reads the preexisting scores from json and gets an initial word
         *
         * @return {void}
         */
        // ini : function()
        // {
        //     this.readScores();
        //     this.wort();
        // },


        // listenToWord : function( word, to, text )
        // {
            // if ( verboseDef !== false && verboseDef[0] === to && text === '-def' )
            // {
                // let _def = verboseDef[1] + ' -\n';

                // for ( let ii = 0, lenII = verboseDef[2].length; ii < lenII; ii++ )
                // {
                //     _def += ( ii + 1 ) + ': ' + verboseDef[2][ ii ].text + '\n';
                // }

                // _bot.say( userConfig.anagramm, _def );

                // verboseDef = false;
            // }
        //     else if ( text.toLowerCase() === word.toLowerCase() )
        //     {
        //         let points, now = Date.now();

        //         if ( wordScores[ to ] )
        //         {
        //             for ( let i = 0, lenI = wordScores[ to ].length; i < lenI; i++ )
        //             {
        //                 if ( wordScores[ to ][ i ] < now - userConfig.anagrammPointTimeout )
        //                 {
        //                     wordScores[ to ].splice( i, 1 );
        //                 }
        //             }

        //             wordScores[ to ].push( now );
        //         }
        //         else
        //         {
        //             wordScores[ to ] = [ now ];
        //         }

        //         points = wordScores[ to ].length;

        //         let solveTime   = Math.floor( ( now - currentWordTime ) / 10 ) / 100;
        //         let botText     = 'WOW ' + to + '! Such ' + points + copy.point[ lang ];
        //         if ( points !== 1 )
        //         {
        //             botText += copy.plural[ lang ];
        //         }
        //         botText += '! Many ' + solveTime + copy.seconds[ lang ];

        //         if ( _modules.Doge && userConfig.anagrammDogePayout )
        //         {
        //             let dogetip = currentWord.length * userConfig.wordsogeModifier;

        //             _modules.Doge.giveFromBank( to, dogetip, true );
        //             botText += copy.youveEarned[ lang ] + dogetip + '!';
        //         }

        //         let additionalDefs = currentWordDef.length - 1;

        //         if ( ! currentWordDef || ! currentWordDef[0] )
        //         {
        //             currentWordDef = [ { text: copy.forgot[ lang ] } ];
        //         }

        //         botText += '\n' + currentWord + ': ' + englishWord + ': ' + currentWordDef[0].text;

        //         if ( additionalDefs !== 0 )
        //         {
        //             botText     += copy.additionalDefs[ lang ]( to, additionalDefs );
        //             verboseDef  = [ to, currentWord, currentWordDef ];
        //         }
        //         else
        //         {
        //             verboseDef      = false;
        //         }

        //         this.writeScores();
        //         _bot.say( userConfig.anagramm, botText );

        //         currentWord     = '';
        //         currentWordDef  = '';
        //         currentWordTime = '';
        //         newWordVote     = [];

        //         _bot.removeListener( 'message' + userConfig.anagramm, wordListener );
        //         this.wort();
        //     }
        // },


        // neuesWort : function( from, to )
        // {
        //     let active =  _modules.core.checkActive( from, to, '', false );

        //     if ( newWordVote.indexOf( to ) === -1 )
        //     {
        //         newWordVote.push( to );
        //     }

        //     let votesNeeded = active.length * userConfig.newWordVoteNeeded;

        //     if ( newWordVote.length < votesNeeded )
        //     {
        //         _bot.say( userConfig.anagramm, to + copy.voteCounted[ lang ]( newWordVote ) + votesNeeded );
        //     }
        //     else
        //     {
        //         if ( currentWord !== '' )
        //         {
        //             _bot.say( userConfig.anagramm, copy.wordVotedOut[ lang ] +
        //                          currentWord + ': ' + englishWord + ': ' + currentWordDef[0].text );
        //             currentWord     = '';
        //         }

        //         currentWordTime = 0;
        //         scrambledWord   = '';
        //         newWordVote     = [];
        //         if ( wordListener )
        //         {
        //             _bot.removeListener( 'message' + userConfig.anagramm, wordListener );
        //         }
        //         this.wort();
        //     }
        // },


        // readScores : function()
        // {
        //     let url = 'json/unscrambleScores.json';

        //     wordScores = JSON.parse( fs.readFileSync( url ) );
        // },


        // responses : function( from, to, text, botText )
        // {
        //     if ( text[0] === userConfig.trigger )
        //     {
        //         text = text.slice( 1 );
        //     }

        //     let command = text.split( ' ' )[ 0 ];

        //     if ( from === userConfig.anagramm )
        //     {
        //         switch ( command )
        //         {
        //             case copy.wordRes[ lang ]:
        //                 this.wort( from, to );
        //                 break;
        //             case copy.newWordRes[ lang ]:
        //                 this.neuesWort( from, to );
        //                 break;
        //         }
        //     }

        //     return botText;
        // },


        // scramble : function( word )
        // {
        //     let originalWord = word;

        //     word = word.split( '' );
        //     let currentIndex = word.length, temporaryValue, randomIndex ;

        //     while ( currentIndex !== 0)
        //     {
        //         randomIndex = Math.floor( Math.random() * currentIndex );
        //         currentIndex--;

        //         temporaryValue         = word[ currentIndex ];
        //         word[  currentIndex ]  = word[ randomIndex ];
        //         word[  randomIndex ]   = temporaryValue;
        //     }

        //     word = word.join( '' );

        //     return ( word === originalWord ) ? scramble( word ) : word;
        // },


        // translate : function( langFrom, langTo, from, to, text, func )
        // {
        //     if ( text[0] === '.' )
        //     {
        //         text = text.replace( '.' + langTo, '' ).trim();
        //     }
        //     else
        //     {
        //         text = text.replace( langTo, '' ).trim();
        //     }

        //     text = encodeURIComponent( text );

        //     let url = ( userConfig.translationBaseUrl ) + 'get?q=' + text + '&langpair=' + langFrom + '|' + langTo;

        //     _modules.core.apiGet( url, function( response )
        //     {
        //         let botText;
        //         response = response.matches;

        //         for ( let i = 0, lenI = response.length; i < lenI; i++ )
        //         {
        //             if ( response[ i ].quality !== '0' )
        //             {
        //                 botText = response[ i ].translation;
        //                 break;
        //             }
        //         }

        //         if ( botText.indexOf( '|' ) !== -1 )
        //         {
        //             botText = botText.split( '|' )[1].slice( 1 );
        //         }

        //         if ( from !== 'internal' )
        //         {
        //             _bot.say( from, to + ': ' + langFrom + ' > ' + langTo + ' - ' + botText );
        //         }

        //         if ( func )
        //         {
        //             func( botText );
        //         }
        //     }, false, from, to );
        // },


        // writeScores : function()
        // {
        //     let wordScoresJson = JSON.stringify( wordScores );

        //     fs.writeFile( './json/unscrambleScores.json', wordScoresJson, function ( err )
        //     {
        //         return console.log( err );
        //     });
        // },


        // wort : function( from, to )
        // {
        //     if ( currentWord === '' )
        //     {
        //         let self       = this;
        //         let excludeList = 'excludePartOfSpeech=affix&' +
        //                             'excludePartOfSpeech=noun-plural&' +
        //                             'excludePartOfSpeech=noun-possesive&' +
        //                             'excludePartOfSpeech=given-name&' +
        //                             'excludePartOfSpeech=family-name&' +
        //                             'excludePartOfSpeech=suffix&' +
        //                             'excludePartOfSpeech=proper-noun&' +
        //                             'excludePartOfSpeech=idiom&' +
        //                             'excludePartOfSpeech=phrasal-prefix&';

        //         let url = ( userConfig.wordnikBaseUrl ) + 'words.json/randomWord?hasDictionaryDef=true&' + excludeList + 'minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=3&maxDictionaryCount=-1&minLength=' + minLength + '&maxLength=' + maxLength + '&api_key=' + userConfig.wordnikAPIKey;
        //         _modules.core.apiGet( url, function( result )
        //         {
        //             if ( result.word[0] !== result.word[0].toLowerCase() ||
        //                     result.word.indexOf( '-' ) !== -1 ||
        //                     result.word.match( /^[a-zA-Z]+$/ ) === null )
        //             {
        //                 self.wort();
        //             }
        //             else
        //             {
        //                 processNewWord( result );
        //             }
        //         }, false, from, to );
        //     }
        //     else
        //     {
        //         _bot.say( userConfig.unscramble, copy.currentWord[ lang ] + scrambledWord.toLowerCase() + ' (' + ( currentWord[0].toLowerCase() ) + ')\n' );
        //     }
        // }
    };
};
