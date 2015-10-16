
var emojica         = require('../lists/emojica');
var questionWords   = require('../lists/questionWords');

module.exports  = function PopKey( _bot, _modules, userConfig )
{
    var apikey      = userConfig.popKeyAPIKey;

    return {
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


        getPrediction : function( from, to, text )
        {
            if ( !this.checkQuestions( text ) || text === '' || text.indexOf( '?' ) === -1 )
            {
                return 'sorry, ' + to + ' that didn\'t look like a question.';
            }
            var emojiCount  = Math.floor( Math.random() * 100 );

            if ( emojiCount < 39 )
            {
                emojiCount = 1;
            }
            else if ( emojiCount > 93 )
            {
                emojiCount = 1;
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


        responses : function( from, to, text, botText )
        {

            var textSplit = text.split( ' ' );
            var command = textSplit[ 0 ].slice( 1 );

            if ( typeof command !== 'string' )
            {
                command = command[ 0 ];
            }

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
