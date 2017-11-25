
const Module        = require( './Module.js' );

const capitalize = word => word.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

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
        const { _modules } = this;

        const textNoSpaces = text.replace( / /g, '%20' );
        const url = `https://api.deckbrew.com/mtg/cards?name=${textNoSpaces}`;
        // const priceUrl = ``;

        return Promise.all([
            new Promise( ( resolve, reject ) =>
            {
                // _modules.core.apiGet( priceUrl, function( res )
                // {
                //     const prices = res.split(',').slice(1, -1).map(r=>r.trim());

                //     if (prices)
                //     {
                //         const price = prices[0];
                //         const high = prices[3];
                //         const low = prices[4];

                //         if (price)
                //         {
                //             resolve(`Price : ${price}€  :  H ${high}€  -  L ${low}€`);
                //         }
                //     }

                    resolve(null);
                // }, false, from, to );
            }),
            new Promise( ( resolve, reject ) =>
            {
                this._modules.core.apiGet( url, function( cards )
                {
                    const filteredCards = cards.filter(c => c.name.toLowerCase() === text.toLowerCase() );

                    const card = filteredCards[0];

                    if ( card )
                    {
                        const { formats, name } = card;

                        let legalFormats = '';

                        Object.keys(formats).forEach( format =>
                        {
                            legalFormats += `${capitalize(format)}: ${capitalize(formats[format])}\n`;
                        });

                        legalFormats += '\n';

                        const link = `http://tappedout.net/mtg-card/${name.replace( ' ', '-' ).toLowerCase()}/`;

                        let imageUrl;

                        card.editions.forEach( cardEdition => {
                            const image = cardEdition['image_url'];

                            if ( !imageUrl && image !== 'https://image.deckbrew.com/mtg/multiverseid/0.jpg' )
                            {
                                imageUrl = image;
                            }
                        });

                        resolve({
                            imageUrl,
                            legalFormats,
                            link,
                        });
                    }

                    resolve(null);
                }, true, from, to );
            })
        ]).then( res =>
        {
            if (res[0] === null && res[1] === null)
            {
                return 'No card found...  I\'m very sorry...';
            }

            const price = res[0] ? `${res[0]}\n\n` :'';

            const {
                imageUrl,
                legalFormats,
                link,
            } = res[1];

            return `${imageUrl}\n${legalFormats}\n${price}${link}`;
        })
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
