
const Module        = require( './Module.js' );

const dumpWeirdChars = /[^a-zA-z0-9 -\/]/g;

const capitalize = word => word.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

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

        this.apiGet         = _modules.core.apiGet;
        this.mtg            = this.mtg.bind(this);
        this.bearerToken    = this.userConfig;
    }


    /**
     * ## mtg
     *
     * performs a basic api name search
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {Sring} text original text minus command
     * @param {Sring} textArr text minus command split into an array by ' '
     *
     * @return {String} card image url
     */
    mtg( from, to, text, textArr )
    {
        return new Promise((resolve, reject) => {
            const {
                mtgApiBaseUrl,
                mtgBearerToken,
                mtgCategory,
                req
            } = this.userConfig;

            const request   = req.request;

            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${mtgBearerToken}`
            };

            const cleanText = text.replace( dumpWeirdChars, '' );

            const postBody  = JSON.stringify({
                sort: 'Sales DESC',
                limit: 10,
                offset: 0,
                filters: [
                    {
                        name: 'ProductName',
                        values: [ cleanText ]
                    },
                    {
                        name: 'Rarity',
                        values: [ 'S', 'T', 'L', 'P', 'C', 'U', 'R', 'M' ]
                    }
                ]
            });

            // if this ever stops working....   check if the manifest changed
            // const options   = {
            //     method  : 'GET',
            //     url     : `https://${mtgApiBaseUrl}/catalog/categories/${mtgCategory}/search/manifest`,
            //     headers : headers,
            // };

            const options   = {
                method  : 'POST',
                url     : `https://${mtgApiBaseUrl}/catalog/categories/${mtgCategory}/search`,
                headers : headers,
                body    : postBody,
            };

            const callback = ( error, response, body ) =>
            {
                if ( body && !error && response.statusCode === 200 )
                {
                    const res = JSON.parse(body).results;

                    if ( !res || res.length < 1 )
                    {
                        console.log(`Sorry ${to}, I didn't find anything.`)

                        return null;
                    }

                    const itemOptions = {
                        method  : 'GET',
                        url     : `https://${mtgApiBaseUrl}/catalog/products/${res.join( ',' )}?getExtendedFields=true`,
                        headers : headers,
                    };

                    const itemCb = ( error, response, body ) =>
                    {
                        const res = JSON.parse(body);

                        if ( !res.results || res.results.length < 1 || res.success !== true )
                        {
                            console.log(`Sorry ${to}, I didn't find anything.`)
                        }
                        else
                        {
                            let exactFound = false;
                            let uniqueResultNames = [];
                            const uniqueResults = {};

                            res.results.forEach(r =>
                            {
                                const cardName      = r.productName.replace(  /\((.)*\)$/, '' ).trim();
                                const cardPosition  = uniqueResultNames.indexOf( cardName );

                                if ( cardPosition === -1 )
                                {
                                    uniqueResultNames.push( cardName );

                                    uniqueResults[ cardName ] = {
                                        name: r.productName,
                                        image: r.image,
                                        store: r.url,
                                        ids:  [ r.productId ],
                                        sets: [ r.group.abbreviation ],
                                    };


                                    r.extendedData.forEach(data =>
                                    {
                                        uniqueResults[ cardName ][ data.name.toLowerCase() ] = data.value;
                                    });
                                }
                                else if ( !exactFound )
                                {
                                    uniqueResults[ cardName ].ids.push( r.productId );
                                    uniqueResults[ cardName ].sets.push( r.group.abbreviation );
                                }
                            });

                            const match = uniqueResultNames.indexOf( cleanText );

                            if ( match !== -1 )
                            {
                                uniqueResultNames = [ uniqueResultNames[ match ] ];
                                exactFound = true;
                            }

                            if ( uniqueResultNames.length === 1 )
                            {
                                const card = uniqueResults[ uniqueResultNames[0] ];

                                const priceOptions = {
                                    method  : 'GET',
                                    url     : `https://${mtgApiBaseUrl}/pricing/product/${card.ids.join(',')}`,
                                    headers : headers,
                                };

                                const priceCb = ( error, response, body ) =>
                                {
                                    const res = JSON.parse(body).results;

                                    const prices = {};

                                    res.forEach( r =>
                                    {
                                        prices[ r.productId ] = prices[ r.productId ] || {};
                                        prices[ r.productId ][ r.subTypeName ] = r;
                                    });

                                    let sets = '';

                                    card.ids.forEach( ( id, i ) =>
                                    {
                                        const cardPrices = prices[ id ];

                                        sets += `\n${card.sets[ i ]}: `;

                                        if ( cardPrices.Normal && cardPrices.Normal.marketPrice )
                                        {
                                            sets += `$${cardPrices.Normal.marketPrice} `;
                                        }

                                        if ( cardPrices.Foil && cardPrices.Foil.marketPrice )
                                        {
                                            sets += `*F* $${cardPrices.Foil.marketPrice} `;
                                        }
                                    });

                                    const oracletext = card.oracletext
                                        .replace(/<br>/gi, '\n')
                                        .replace(/<\/?em>/gi, '_')
                                        .replace(/<\/?b>/gi, '*');

                                    resolve( `${card.image}\n${card.name}\n\n${oracletext}\n${sets}` );
                                };

                                request( priceOptions, priceCb );
                            }
                            else
                            {
                                resolve(`Can you be more specific? I found ${uniqueResultNames.join( ', ' )}`);
                            }
                        }
                    };

                    request(itemOptions, itemCb);
                }
                else if ( response.statusCode === 401 )
                {
                    console.log('refreshing mtg api token....');
                    resolve(this.setBearerToken(this.mtg, [ from, to, text, textArr ] ));
                }
            }

            request(options, callback);
        });
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
                    desc    : 'searches for a magic card by name',
                    syntax      : [
                        `${trigger}m <query>`
                    ]
                },

                mtg : {
                    f       : this.mtg,
                    desc    : 'searches for a magic card by name',
                    syntax      : [
                        `${trigger}mtg <query>`
                    ]
                },

                tok : {
                    f       : () => {
                        return this.setBearerToken( ()=>{}, []);
                    },
                    desc    : 'searches for a magic card by name',
                    syntax      : [
                        `${trigger}mtg <query>`
                    ]
                },
            }
        };
    }

    setBearerToken( cb, arr )
    {
        return new Promise((resolve, reject) => {
            const { userConfig } = this;

            const {
                mtgApiBaseUrl,
                mtgApiPublicKey,
                mtgApiPrivateKey,
                mtgBearerTokenExp,
                req
            } = userConfig;

            const request   = req.request;
            const now       = Date.now();

            const headers   = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            const postBody  = `grant_type=client_credentials&client_id=${mtgApiPublicKey}&client_secret=${mtgApiPrivateKey}`;

            const options   = {
                url: `https://${mtgApiBaseUrl}/token`,
                method: 'POST',
                headers: headers,
                body: postBody
            };

            const callback = ( error, response, body ) =>
            {
                if ( !error && response.statusCode == 200 )
                {
                    const res = JSON.parse( body );

                    userConfig.mtgBearerTokenExp = now + res[ 'expires_in' ] - 10000; // 10000 buffer
                    userConfig.mtgBearerToken = res[ 'access_token' ];
                    resolve(cb( ...arr ));
                }
            }

            request(options, callback);
        });
    }
};


module.exports = Mtg;
