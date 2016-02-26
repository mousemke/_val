
var Words   = require( './words.js' );
var copy    = require( './i18n/words.i18n.js' );

module.exports = function Anagramm( _bot, _modules, userConfig )
{
    var activeAnagramm = {
        currentWord     : '',
        currentWordTime : 0,
        currentWordDef  : '',
        englishWord     : '',
        minLength       : 4,
        maxLength       : 8,
        newWordVote     : [],
        scrambledWord   : '',
        wordScores      : {},
        wordListener    : undefined,
        verboseDef      : false,
        lang            : userConfig.anagrammLang,
        channel         : userConfig.anagrammChannel,
        dogePayout      : userConfig.anagrammDogePayout,
        dogeModifier    : userConfig.anagrammDogeModifier,
        pointTimeout    : userConfig.anagrammPointTimeout
    };

    var lang = userConfig.anagrammLang;

    words = new Words( _bot, _modules, userConfig, activeAnagramm );


    /**
     * ## processNewWord
     *
     * processes a new word grabbed from the api and does anything needed
     * to make it ready
     *
     * @param  {Object} result word with all related properties
     * @param  {String} to originating user
     *
     * @return _Void_
     */
    words.processNewWord = function( result, to, activeWord )
    {
        activeWord.currentWord      = result.word.slice();
        activeWord.englishWord      = result.word;
        activeWord.currentWordTime  = Date.now();

        this.define( userConfig.anagramm, activeWord.currentWord, true, to );

        var self = this;

        this.translate( 'en', lang, 'internal', null, lang + ' ' + activeWord.currentWord,
        function( translatedWord )
        {
            activeWord.currentWord             = translatedWord;

            var currentWordLength   = activeWord.currentWord.length;

            if ( activeWord.currentWord[ currentWordLength - 1 ] === '.' )
            {
                activeWord.currentWord.slice( currentWordLength - 1 );
            }

            activeWord.scrambledWord   = self.scramble( activeWord.currentWord );

            if ( activeWord.currentWord.indexOf( '-' ) !== -1 ||
                activeWord.currentWord.indexOf( ' ' ) !== -1 ||
                activeWord.currentWord.toLowerCase() === activeWord.englishWord )
            {
                activeWord.currentWord = '';
                self.word();
            }
            else
            {
                _bot.say( userConfig.anagrammChannel, copy.newWord[ lang ] + activeWord.scrambledWord.toLowerCase() + ' (' + ( activeWord.currentWord[0].toLowerCase() ) + ')' );
                activeWord.wordListener    = self.listenToWord.bind( self, activeWord.currentWord );
                _bot.addListener( 'message' + userConfig.anagrammChannel, activeWord.wordListener );
            }
        } );
    }

    return words;
};
