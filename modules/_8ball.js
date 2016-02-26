
/**
 * a magic 8ball that tells the future 100% accurately.  It's not val's fault
 * we cant properly understand it's context
 *
 * base on https://xkcd.com/1525/
 */
var emojica         = require('../lists/emojica');
var questionWords   = require('../lists/questionWords');

module.exports  = function PopKey( _bot, _modules, userConfig )
{
    return {
        /**
         * ## checkQuestions
         *
         * determines whether or not the delivered question is actually one
         *
         * @param {String} text original text
         *
         * @return _Boolean_ question or not
         */
        checkQuestions : function( text )
        {
            var count       = 0;
            var none        = 0 - questionWords.length;
            var textSplit   = text.split( ' ' );

            questionWords.forEach( function( word )
            {
                count += textSplit.indexOf( word );
            } );

            return count === none ? false : true;
        },


        /**
         * ## getPrediction
         *
         * double check that the text is a question, then tells the future
         * through a very scientific and magical process
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {Sring} text original text minus command
         *
         * @return _String_ visions of the future
         */
        getPrediction : function( from, to, text )
        {
            if ( !this.checkQuestions( text ) || text === '' || text.indexOf( '?' ) === -1 )
            {
                return 'sorry, ' + to + ' that didn\'t look like a question.';
            }
            var emojiCount  = Math.floor( Math.random() * 100 );

            if ( emojiCount < 39 || emojiCount > 93 )
            {
                emojiCount = 1;
            }
            else if ( emojiCount > 98 || emojiCount < 3 )
            {
                emojiCount = 3;
            }
            else
            {
                emojiCount = 2;
            }

            var res = '', emojiLength = emojica.length;;
            for ( var i = 0; i < emojiCount; i++ )
            {
                res += emojica[ Math.floor( Math.random() * emojiLength ) ];
            }

            return res;
        },


        /**
         * 8ball responses
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command )
        {
            switch ( command )
            {
                case '8ball':
                    botText = this.getPrediction( from, to, textSplit.slice( 1 ).join( ' ' ) );
                    break;
            }

            return botText;
        }
    }
};
