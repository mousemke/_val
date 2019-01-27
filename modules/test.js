
const Module = require( './Module.js' );

class Test extends Module
{
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
        super( _bot, _modules, userConfig, commandModule );
    }


    /**
     * ## test
     *
     * this function is run with the test command.  it exists purely for feature
     * testing.  otherwise it does nothing
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     *
     * @return {Boolean}  false
     */
    test( from, to, text )
    {
        const nlp = require( 'compromise' );
console.log('this is all disabled for now.  go here => http://compromise.cool/')
        // const textObj   = nlp( text );



        // const textRoot  = textObj.root();
        // const terms     = textObj.terms();
        // const verb      = nlp.verb( text );

        // const sentence  = nlp.sentence( text );
        // const sentenceType = sentence.sentence_type();

        // const tags      = sentence.tags();
        // let botText = '';

        // terms.forEach( t =>
        // {
        //     botText += `${t.text}: ${JSON.stringify( t )}\n`;
        // } );

        // return botText;

        // return `root sentence: ${textRoot}
        //             sentence type: ${sentenceType}
        //             verb: ${JSON.stringify( verb.to_present() )}
        //             verb is negative: ${verb.isNegative()}
        //             tags: ${JSON.stringify( tags )}
        //             terms: ${JSON.stringify( terms )}`;
        // return tags;
    }

    /**
     * ## responses
     *
     * @return {Object} responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            commands : {
                test : {
                    f       : this.test,
                    desc    : 'never really know what you\'ll find here...',
                    syntax      : [
                        `${trigger}test <things maybe?>`
                    ]
                }
            }
        }
    }
};

module.exports  = Test;
