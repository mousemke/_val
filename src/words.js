var wordnikAPIKey   = '2b79afb305c66bf9bf00f026b7a02f49e85b963364a580810',
    minLength       = 4,
    maxLength       = 8,
    currentWord     = '',
    currentWordDef  = '',
    scrambledWord   = '',
    wordListener;

module.exports  = function Words( _bot, apiGet, userData, userConfig )
{
    return {

        init : function()
        {
            this.word();
        },


        define : function( from, word, current )
        {
            var definition;

            var url = 'http://api.wordnik.com:80/v4/word.json/' + word.toLowerCase() + '/definitions?limit=1&includeRelated=true&useCanonical=true&includeTags=false&api_key=' + wordnikAPIKey
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
                _bot.say( userConfig.unscramble, 'Good Job ' + to + ' !\n' + currentWord + ': ' + currentWordDef );
                currentWord     = '';
                currentWordDef  = '';
                //doge tip per length?
                this.newWord();
            }
        },


        newWord : function()
        {
            _bot.removeListener( 'message' + userConfig.unscramble, wordListener );

            if ( currentWord !== '' )
            {
                _bot.say( userConfig.unscramble, 'aww...   it\'s not that hard!  it was ' + currentWord + '\n' + currentWordDef );
                currentWord     = '';
            }

            scrambledWord   = '';
            this.word();
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
                        this.newWord( from, text, true );
                        break;
                }
            }

            switch ( command )
            {
                case 'define':
                    this.define( from, text.split( ' ' )[ 1 ] );
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
