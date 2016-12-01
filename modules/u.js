
/**
 * the u conversations
 *
 * based on http://www.flashforwardpod.com/2016/04/05/episode-10-rude-bot-rises/ (5:30)
 *
 * @author  Mouse Braun <mouse@knoblau.ch>
 *
 */
var words       = require( '../json/u.json' );

class U
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
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
    }


    talk( from, to, text, textSplit )
    {
        var _w, _ts, res = [];

        for ( var i = 0, lenI = textSplit.length; i < lenI; i++ )
        {
            _ts = textSplit[ i ].replace( /\W/g, '' ).toLowerCase();

            words.forEach( function( _w )
            {
                const _wSmall = _w.replace( /[^\da-zA-Z\s]/g, '' ).toLowerCase();

                if ( _wSmall.indexOf( _ts ) !== -1 && res.indexOf( _wSmall ) === -1 )
                {
                    res.push( _w );
                }
            } );
        }

        return res.length !== 0 ? res[ Math.floor( Math.random() * res.length ) ] : '';
    }


    /**
     * ## responses
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full input string
     * @param {String} botText text to say
     * @param {String} command bot command (first word)
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return _String_ changed botText
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            u : {
                f       : this.talk,
                desc    : 'interesting political discussions with someone angry',
                syntax  : [
                    `${trigger}u <question>`
                ]
            }
        };
    }
};

module.exports = U;
