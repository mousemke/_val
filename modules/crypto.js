
const http      = require( 'http' );
const https     = require( 'https' );
const fs        = require( 'fs' );
const Module    = require( './Module.js' );

const TIMEOUT           =  30; // in min
const MARKET_TIMEOUT    =  5; // in min
const MARKETS           = 'https://api.coinmarketcap.com/v1/ticker/?limit=500';
const BTC_MARKET        = 'https://api.coindesk.com/v1/bpi/currentprice.json';
const CURRENCY          = 'EUR';
const CURRENCY_SYMBOL   = '€';

let tickers         = {};
let marketPrices    = {};
let fiatPrices      = {};
let tickerIntervals = {};
let tickerTimeouts  = {};

class Crypto extends Module
{
    /**
     * ## activeTickers
     *
     * reports the active tickers in the current channel
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     * @param {String} textArr full message text split by " "
     * @param {String} command trigger word that brought us here
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {String} list of activly tracked coins
     */
    activeTickers( from, to, text, textArr, command, confObj )
    {
        return this.tickNow( from, to, text, textArr, command, confObj );
    }

    /**
     * ## availableCoins
     *
     * lists the coins that are available for the ticker
     *
     * @return {String} available coins
     */
    availableCoins()
    {
        const coins = 'Available coins are:';

        return `${coins} ${Object.keys(marketPrices).join( ', ' ).toUpperCase()}`;
    }


    buildTicker( channelId )
    {
        const {
            tick,
            _bot
        } = this;

        const localTickers = tickers[ channelId ];

        if ( localTickers )
        {
            tickerIntervals[ channelId ] = tickerIntervals[ channelId ] || {};

            clearTimeout(tickerTimeouts[ channelId ]);
            tickerTimeouts[ channelId ] = setTimeout(() => _bot.say(channelId, tick(localTickers)), 20000);

            clearInterval( tickerIntervals[ channelId ] );
            tickerIntervals[ channelId ] = setInterval(() => _bot.say(channelId, tick(localTickers)), TIMEOUT * 1000 * 60 );
        }
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
        super( _bot, _modules, userConfig, commandModule );

        this.updateMarket   = this.updateMarket.bind(this);
        this.startTicker    = this.startTicker.bind(this);
        this.tick           = this.tick.bind(this);

        this.updateMarket();

        setTimeout( this.startTicker, 60000 );

        this.marketInterval = setInterval( this.updateMarket, MARKET_TIMEOUT * 1000 * 60 );
    }


    fixed2( num )
    {
        let fixed = `${parseInt( num * 100 ) / 100}`;

        const decimal = fixed.split('.')[ 1 ];

        if ( !decimal || decimal.length === 1 )
        {
            fixed = `${fixed}0`;
        }

        return fixed;
    }


    /**
     * ## loadTickerList
     *
     * loads the json for the master ticker list
     *
     * @return {Void}
     */
    loadTickerList()
    {
        const botName   = this._bot.name;
        const url       = `json/tickers/tickers.${botName}.json`;

        try
        {
            tickers = JSON.parse( fs.readFileSync( url, 'utf8' ) );
        }
        catch( e )
        {
            tickers = {};
            this.saveTickerList();
        }
    }


    /**
     * ## market
     *
     * returns the price of a certain amount of a single coin in EUR
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     * @param {String} textArr full message text split by " "
     *
     * @return {String} list of activly tracked coins
     */
    market( from, to, text, textArr )
    {
        const coin      = textArr[0].toLowerCase();
        const amount    = parseFloat(textArr[1]);

        let botText = '';

        if ( !coin || isNaN(amount) )
        {
            return 'invalid syntax';
        }

        if ( !marketPrices[ coin ] )
        {
            const { trigger } = this.userConfig;

            return `invalid coin abbreviation.  check ${trigger}availableCoins for available coins`;
        }

        const value = amount * marketPrices[ coin ];

        return `${amount} ${coin.toUpperCase()} = ${this.fixed2(value)}${CURRENCY_SYMBOL}`;
    }


    /**
     * ## responses
     *
     * @return {Object} responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            commands: {
                activeTickers : {
                    f       : this.activeTickers,
                    desc    : 'lists the tickers that are active for this channel',
                    syntax      : [
                        `${trigger}activeTickers`
                    ]
                },

                availableCoins : {
                    f       : this.availableCoins,
                    desc    : 'lists the coins available for tickers',
                    syntax      : [
                        `${trigger}availableCoins`
                    ]
                },

                market : {
                    f       : this.market,
                    desc    : `returns the price of a certain amount of a single coin in ${CURRENCY}`,
                    syntax      : [
                        `${trigger}market <coin> <amount>`
                    ]
                },

                setTicker : {
                    f       : this.setTicker,
                    desc    : 'adds or removes a coin in the ticker',
                    syntax      : [
                        `${trigger}setTicker <coin> <amount>`
                    ]
                },

                tickNow : {
                    f       : this.tickNow,
                    desc    : 'reports the channel ticker now',
                    syntax      : [
                        `${trigger}tickNow`
                    ]
                }
            }
        };
    }


    /**
     * ## saveTickerList
     *
     * saves the json to the master ticker list
     *
     * @return {Void}
     */
    saveTickerList()
    {
        const botName = this._bot.name;

        const tickersJSON = JSON.stringify( tickers );
        fs.writeFileSync( `./json/tickers/tickers.${botName}.json`, tickersJSON, 'utf8' );
    }


    startTicker( channelId )
    {
        this.loadTickerList();

        if ( channelId )
        {
            this.buildTicker( channelId );
        }
        else
        {
            Object.keys( tickers ).forEach(t =>
            {
                this.buildTicker( t );
            });
        }
    }


    /**
     * ## setTicker
     *
     * sets a ticker to a room
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     * @param {String} textArr full message text split by " "
     * @param {String} command trigger word that brought us here
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {String} success message
     */
    setTicker( from, to, text, textArr, command, confObj )
    {
        const coin      = textArr[0].toLowerCase();
        const amount    = textArr[1];

        let botText = '';

        if (!coin)
        {
            return 'invalid syntax';
        }

        this.loadTickerList();

        const channelId = confObj.from;

        tickers[ channelId ] = tickers[ channelId ] || {};

        if ( ( !amount || amount === '0' ) && tickers[ channelId ][ coin ] )
        {
            delete tickers[ channelId ][ coin ];

            botText = `${coin.toUpperCase()} ticker removed`;

            if ( Object.keys(tickers[ channelId ]).length === 0 )
            {
                delete tickers[ channelId ];
            }
        }
        else if (amount)
        {
            if (!marketPrices[ coin ])
            {
                const { trigger } = this.userConfig;

                return `invalid coin abbreviation.  check ${trigger}availableCoins for available coins`;
            }

            tickers[ channelId ][ coin ] = amount;

            botText = `${coin.toUpperCase()} ticker set for ${amount}`;
        }

        this.saveTickerList();
        this.startTicker(channelId);

        return botText;
    }


    tick(localTickers)
    {
        let eurTotal    = 0;
        let botText     = '';

        Object.keys(localTickers).forEach(coin =>
        {
            const coinCount = localTickers[ coin ];
            const coinValue = coinCount * marketPrices[ coin ];

            if (Number.isNaN(coinValue)) {
                botText += `|    ${coin.toUpperCase()} prices are not available\n`;
            }
            else {
                botText += `|    ${coin.toUpperCase()}: ${coinCount}; ${this.fixed2(coinValue)}${CURRENCY_SYMBOL}\n`;
                eurTotal += coinValue
            }
        });

        botText += `|\n|    Total: ${this.fixed2( eurTotal )}${CURRENCY_SYMBOL}\n|`;

        return botText;
    }


    tickNow( from, to, text, textArr, command, confObj )
    {
        this.loadTickerList();

        const localTickers = tickers[confObj.from];

        if ( !localTickers )
        {
            return 'there are no crypto tickers for this channel';
        }

        return this.tick(localTickers);
    }


    updateMarket()
    {
        const apiGet = this._modules.core.apiGet;

        return Promise.all([
            new Promise((resolve, reject) =>
            {
                apiGet( MARKETS, market =>
                {
                    resolve(Object.assign( {}, ...market.map(m => {
                        if (m.symbol === 'BTC')
                        {
                            return null;
                        }

                        return {
                            [m.symbol.toLowerCase()] : m['price_btc']
                        };
                    }).filter(a => !!a)));
                }, true, '', '' );
            }),
            new Promise((resolve, reject) =>
            {
                apiGet( BTC_MARKET, btcToEur =>
                {
                    resolve(Object.assign( {}, ...Object.keys(btcToEur.bpi).map(currency =>
                    {
                       return {
                        [currency] : parseFloat(btcToEur.bpi[currency].rate.replace(',', ''))
                       }
                    })));
                }, true, '', '' );
            })
        ]).then( res =>
        {
            fiatPrices      = res[ 1 ];

            const activeCurrency = fiatPrices[ CURRENCY ];

            Object.keys(res[ 0 ]).forEach(coin =>
            {
                res[ 0 ][ coin ] = res[ 0 ][ coin ] * activeCurrency;
            });

            res[ 0 ].btc = activeCurrency;
            marketPrices = res[ 0 ];

            return res;
        });
    }
};

module.exports = Crypto
