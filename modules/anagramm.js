
const Words   = require( './words.js' );
const copy    = require( './i18n/words.i18n.js' );

module.exports = function Anagramm( _bot, _modules, userConfig, commandModule )
{
    let activeAnagramm = {
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

    let lang    = userConfig.anagrammLang;

    let words   = new Words( _bot, _modules, userConfig, activeAnagramm );


    /**
     * ## processNewWord
     *
     * processes a new word grabbed from the api and does anything needed
     * to make it ready
     *
     * @param {Object} result word with all related properties
     * @param {String} to originating user
     * @param {Object} activeWord the current word object that is to be guessed
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return _Void_
     */
    words.processNewWord = function( result, to, activeWord, confObj )
    {
        return new Promise( ( resolve, reject ) =>
        {
            let englishWord             = result.word;

            activeWord.currentWord      = result.word.slice();
            activeWord.currentWordTime  = Date.now();

            this.define( userConfig.anagramm, activeWord.currentWord, true, to );

            let self = this;

            this.translate( 'en', lang, 'internal', null, `${lang} ${activeWord.currentWord}`,

                function( translatedWord )
                {
                    let currentWord         = activeWord.currentWord  = translatedWord;

                    let currentWordLength   = currentWord.length;

                    activeWord.scrambledWord   = self.scramble( activeWord.currentWord );

                    if ( currentWord.indexOf( '-' ) !== -1 ||
                        currentWord.indexOf( ' ' ) !== -1 ||
                        currentWord.indexOf( '.' ) !== -1 ||
                        currentWord.toLowerCase() === englishWord )
                    {
                        activeWord.currentWord = '';
                        resolve( self.word() );
                    }
                    else
                    {
                        activeWord.wordListener    = self.listenToWord.bind( self, activeWord.currentWord );

                        _bot.addListener( 'message' + userConfig.anagrammChannel, activeWord.wordListener );

                        resolve( `${copy.newWord[ lang ]}${activeWord.scrambledWord.toLowerCase()} (${activeWord.currentWord[0].toLowerCase()})` );
                    }
                }
            );
        } );
    }

    return words;
};
