
/**
 * a magic 8ball that tells the future 100% accurately.  It's not val's fault
 * we cant properly understand it's context
 *
 * base on https://xkcd.com/1525/
 */
var emojica         = require('../lists/emojica');
var questionWords   = require('../lists/questionWords');

class _8ball
{
    /**
     * ## checkQuestions
     *
     * determines whether or not the delivered question is actually one
     *
     * @param {String} text original text
     *
     * @return {Boolean} question or not
     */
    checkQuestions( text )
    {
        var count       = 0;
        var none        = 0 - questionWords.length;
        var textSplit   = text.split( ' ' );

        questionWords.forEach( word =>
        {
            count += textSplit.indexOf( word );
        } );

        return count === none ? false : true;
    }


    /**
     * ## constructor
     *
     * sets the initial "global" variables
     *
     * @param {Object} _bot instance of _Val with a core attached
     * @param {Object} _modules config and instance of all modules
     * @param {Object} userConfig available options
     * @param {Object} commandModule instance of the applied core
     *
     * @return {Void} void
     */
    constructor( _bot, _modules, userConfig, commandModule )
    {
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
    }


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
     * @return {String} visions of the future
     */
    getPrediction( from, to, text )
    {
        if ( !this.checkQuestions( text.toLowerCase() ) || text === ''
                || text.indexOf( '?' ) === -1 )
        {
            return `sorry, ${to} that didn't look like a question.`;
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
    }


    /**
     * 8ball responses
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full input string
     * @param {String} botText text to say
     * @param {String} command bot command (first word)
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {String} changed botText
     */
    responses()
    {
        return {
            '8ball': {
                f       : this.getPrediction,
                desc    : `let ${this._bot.name} predict the future`,
                syntax      : [
                    `${this.userConfig.trigger}8ball <question>?`
                ]
            }
        };
    };
};

module.exports  = _8ball;
