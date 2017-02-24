
const Module        = require( './Module.js' );

/**
 * a magicthegathering.io search module
 */
class Mtg extends Module
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

        this.apiGet = _modules.core.apiGet;
    }


    /**
     * ## mtg
     *
     * performs a basic api name search
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {Sring} text original text minus command
     *
     * @return {String} card image url
     */
    mtg( from, to, text )
    {
        var textNoSpaces = text.replace( / /g, '%20' );
        var url = `https://api.magicthegathering.io/v1/cards?name="${text}"`;

        return new Promise( ( resolve, reject ) =>
        {
            this._modules.core.apiGet( url, function( res )
            {
                var cards = res.cards;
                var imageUrl;

                cards.forEach( _c =>
                {
                    imageUrl = _c.imageUrl;

                    if ( imageUrl )
                    {
                        resolve( imageUrl );
                    }
                } );
            }, true, from, to );
        } );
    }


    /**
     * mtg responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            m   : {
                f       : this.mtg,
                desc    : 'searches for a magic card of the given name',
                syntax      : [
                    `${trigger}m <query>`
                ]
            },

            mtg : {
                f       : this.mtg,
                desc    : 'searches for a magic card of the given name',
                syntax      : [
                    `${trigger}mtg <query>`
                ]
            }
        };
    }
};


module.exports = Mtg;
