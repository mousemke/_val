var wordnikAPIKey   = '2b79afb305c66bf9bf00f026b7a02f49e85b963364a580810',
    minLength       = 5,
    maxLength       = 9,
    currentWord     = '',
    scrambledWord   = '';

module.exports  = function Words( _bot, apiGet, userData, userConfig )
{
    return {

        init : function()
        {
            this.word();
        },



        listenToWord : function( word, to, text )
        {
            if ( text === word )
            {
                _bot.say( userConfig.unscramble, 'Good Job ' + to + ' !' );
                //doge tip per length?
                this.newWord();
            }
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


        newWord : function()
        {
            _bot.removeListener( 'message' + userConfig.unscramble, this.listenToWord );
            currentWord     = '';
            scrambledWord   = '';
            this.word();
        },


        word : function( type )
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
                    currentWord     = result.word;
                    scrambledWord   = scope.scramble( currentWord );
                    _bot.say( userConfig.unscramble, 'The new scramble word is: ' + scrambledWord + ' (' + ( currentWord[0] ) + ')' );
                    _bot.addListener( 'message' + userConfig.unscramble, scope.listenToWord.bind( scope, result.word ) );
                }, false);
            }
            else
            {
                _bot.say( userConfig.unscramble, 'The current scramble word is: ' + scrambledWord + ' (' + ( currentWord[0] ) + ')' );
            }
        }
    };
};