
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
        const textNoSpaces = text.replace( / /g, '%20' );
        const url = `https://api.deckbrew.com/mtg/cards?name=${textNoSpaces}`;

        return new Promise( ( resolve, reject ) =>
        {
            this._modules.core.apiGet( url, function( cards )
            {
                const filteredCards = cards.filter(c => c.name.toLowerCase() === text.toLowerCase() );

                const card = filteredCards[0];

                if ( card )
                {
                    const { formats, name } = card;

                    let legalFormats = 'Legal in: ';
                    Object.keys(formats).forEach( r => {
                        if ( formats[r] === 'legal') {
                            legalFormats += `${r}, `;
                        }
                    });

                    legalFormats = legalFormats.slice(0, -2);

                    const link = `http://tappedout.net/mtg-card/${name.replace( ' ', '-' ).toLowerCase()}/`;

                    card.editions.forEach( cardEdition => {
                        const imageUrl = cardEdition['image_url'];

                        if ( imageUrl && imageUrl !== 'https://image.deckbrew.com/mtg/multiverseid/0.jpg' )
                        {
                            resolve( `${imageUrl}\n${legalFormats}\n\n${link}` );
                        }
                    });

                    resolve(`${legalFormats}\n\n${link}`);
                }

                resolve( 'No card found...  I\'m very sorry...' );
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
            commands : {
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
            }
        };
    }
};


module.exports = Mtg;
