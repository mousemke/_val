
const http          = require( 'http' );
const https         = require( 'https' );
const fs            = require( 'fs' );
const Module        = require( './Module.js' );

let dcMasterList    = {};

class Doge extends Module
{
    /**
     * ## balance
     *
     * returns a users balance
     *
     * @param {String} from originating channel
     * @param {String} to user
     * @param {String} text full message text
     *
     * @return {Void}
     */
    balance( from, to, text )
    {
        const _modules = this._modules;

        return new Promise( ( resolve, reject ) =>
        {
            var _balanceCB = function( _to, success )
            {
                _to = _to.toLowerCase();

                if ( success )
                {
                    var amount      = dcMasterList[ _to ];
                    amount          = ( amount ) ? amount : 0;

                    var botText     = '';

                    if ( _to === 'mastertotal' )
                    {
                        botText += `There are currently Ð${amount} in circulation`;
                    }
                    else if ( _to === '___bank___' )
                    {
                        botText += `There are currently Ð${amount} in the bank`;
                    }
                    else
                    {
                        if ( from !== _to )
                        {
                          botText += `${to}, `;
                        }
                        botText += `you currently have Ð${amount}`;
                    }

                    resolve( botText );
                }
            };

            if ( text.split( ' ' )[ 0 ] === 'all' )
            {
                _balanceCB( 'masterTotal', true );
            }
            else if ( text.split( ' ' )[ 0 ] === 'bank' )
            {
                _balanceCB( '___bank___', true );
            }
            else
            {
                _modules.core.userData( to, from, _balanceCB, text );
            }
        } );
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

        if ( userConfig.dogeTickerEnabled )
        {
            this.startTicker();
        }

        this.loadMasterList();
    }


    deposit( from, to, text )
    {
        // return new Promise( ( resolve, reject ) =>
        // {
        //     var _depositCB = function( from, _to, _info, _whois )
        //     {
        //          _to = _to.toLowerCase();
        //          var botText = '';
        //          if ( from !== _to )
        //          {
        //              botText += _to + ', ';
        //          }

        //          botText += 'please deposit your Ð to ' + dcMasterList[ _whois.host ];

        //         resolve( botText );
        //     };

        //     _modules.core.userData( from, to, _depositCB );

        // });

        return 'deposit and withdraw are in between APIs at the moment.  Ask mouse for more info';
    }


    /**
     * ## doge
     *
     * returns satoshi value of 1 doge
     *
     * @param {String} from originating channel
     *
     * @return {Void}
     */
    doge( from, to, text, full )
    {
        const _modules = this._modules;

        var toSatoshi = function( num )
        {
            return Math.floor( num * 100000000 );
        }

        var textSplit = text.split( ' ' );
        var url = 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=BTC-DOGE';

        return new Promise( ( resolve, reject ) =>
        {
            _modules.core.apiGet( url, function( info )
            {
                var price, amount = parseInt( textSplit[ 0 ] );

                if ( typeof amount !== 'number' || isNaN( amount ) === true )
                {
                    amount = 1;
                }

                var res         = info.result[0];
                var dogeBase    = res.Last;
                var lastPrice   = amount * toSatoshi( res.Last );
                var doge        = `狗狗币!  Ð${amount} = ${lastPrice} Satoshi`;

                if ( full )
                {
                    url =' https://api.coindesk.com/v1/bpi/currentprice.json';

                    _modules.core.apiGet( url, function( { bpi} )
                    {
                        var formatPrice = function( price )
                        {
                            price = price.replace( ',', '' )
                                            .replace( ',', '.' );

                            price = ( price * dogeBase * amount );
                            return price > 1 ? price.toFixed( 2 ) : price.toFixed( 4 );
                        };

                        var usd = formatPrice( bpi.USD.rate );
                        var eur = formatPrice( bpi.EUR.rate );
                        doge += `, $${usd}, ${eur}€`;

                        resolve( doge );
                    }, true, from, to )
                }
                else
                {
                    var highPrice   = amount * toSatoshi( res.High );
                    var lowPrice    = amount * toSatoshi( res.Low );
                    doge += `. TO THE MOON!!!! ( H: ${highPrice}, L: ${lowPrice} )`;

                    resolve( doge );
                }
            }, true, from, to );
        } );
    }


    /**
     * ## dogePrice
     *
     * returns the price in satoshi
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full input string
     *
     * @return {String} price
     */
    dogePrice( from, to, text )
    {
        return this.doge( from, to, text, false );
    }


    /**
     * ## giveFromBank
     *
     * sends prize money from the bank
     *
     * @param  {String} to who to transfer doge to
     * @param  {Number} amount amount to transfer
     * @param  {String} silent silent or spoken
     *
     * @return {String}
     */
    giveFromBank( to, amount, silent )
    {
        silent = silent || false;

        dcMasterList[ to.toLowerCase() ]  = dcMasterList[ to.toLowerCase() ]  + amount || amount;
        dcMasterList.___bank___  = dcMasterList.___bank___  - amount;

        this.writeMasterList();

        if ( silent )
        {
            return '';
        }

        return `${to} earns such Ð${amount}`;
    }


    /**
     * ## loadMasterList
     *
     * loads the json for the master bank list
     *
     * @return {Void}
     */
    loadMasterList()
    {
        var url = 'json/dcMasterList.json';

        dcMasterList = JSON.parse( fs.readFileSync( url ) );
    }


    /**
     * ## marketPrice
     *
     * returns the price in multiple currencies
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full input string
     *
     * @return {String} price
     */
    marketPrice( from, to, text )
    {
        return this.doge( from, to, text, true );
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
                doge : {
                    f       : this.dogePrice,
                    desc    : 'return the price of doge in satoshi',
                    syntax      : [
                        `${trigger}doge`,
                        `${trigger}doge <amount>`
                    ]
                },

                market : {
                    f       : this.marketPrice,
                    desc    : 'return the price of doge in multiple currencies',
                    syntax      : [
                        `${trigger}market`,
                        `${trigger}market <amount>`
                    ]
                },

                tip : {
                    f       : this.tip,
                    desc    : 'tip someone',
                    syntax      : [
                        `${trigger}tip <user> <amount>`
                    ]
                },

                withdraw : {
                    f       : this.withdraw,
                    desc    : 'withdraw some doge to an external wallet',
                    syntax      : [
                        `${trigger}withdraw <amount>`
                    ]
                },

                balance : {
                    f       : this.balance,
                    desc    : 'returns a users balance',
                    syntax      : [
                        `${trigger}balance`,
                        `${trigger}balance bank`,
                        `${trigger}balance all`
                    ]
                },

                deposit : {
                    f       : this.deposit,
                    desc    : 'deposit money doge in from an external wallet',
                    syntax      : [
                        `${trigger}deposit <amount>`
                    ]
                },

                makeitrain : {
                    f       : this.soak,
                    desc    : 'tip all active users',
                    syntax      : [
                        `${trigger}makeitrain <amount>`
                    ]
                },

                startTicker : {
                    f       : this.startTicker,
                    desc    : 'starts the doge ticker',
                    syntax      : [
                        `${trigger}startTicker`
                    ]
                },

                stopTicker : {
                    f       : this.stopTicker,
                    desc    : 'stops the doge ticker',
                    syntax      : [
                        `${trigger}stopTicker`
                    ]
                },

                soak : {
                    f       : this.soak,
                    desc    : 'tip all active users',
                    syntax      : [
                        `${trigger}soak <amount>`
                    ]
                }
            }
        };
    }


    /**
     * ## soak
     *
     * takes a tip and splits it up between all active users after nickserv authentication
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full message text
     *
     * @return {Void}
     */
    soak( from, to, text )
    {
        var i, lenI, self  = this;
        const _modules      = this._modules;
        const _bot          = this._bot;
        const userConfig    = this.userConfig;

        var list            = _modules.core.checkActive( from, to, text, false );
        const users         = list.length - 1;
        var textSplit       = text.split( ' ' );
        var soakTotal       = parseInt( textSplit[ 0 ] );
        var soakAmount      = Math.floor( soakTotal / users );
        var soakRemainder   = soakTotal - ( soakAmount * users );
        let botText         = '';

        return new Promise( ( resolve, reject ) =>
        {
            var _soakCB = function( _to, success, textSplit, origText )
            {
                _to = _to.toLowerCase();

                if ( !dcMasterList[ _to ] || dcMasterList[ _to ] < soakTotal )
                {
                    resolve( `Sorry, ${to}, you need more doge` );
                }
                else if ( soakTotal < 1 )
                {
                    resolve( `Don't be so down, ${to}...  Stay positive!` );
                }
                else
                {
                    if ( ! text[ 1 ] || typeof soakTotal !== 'number' || isNaN( soakTotal ) )
                    {
                        resolve( `you must give an amount ( ${userConfig.trigger}soak <amount> )` );
                    }
                    else if ( users === 0 )
                    {
                        resolve( 'so, you just want to soak yourself then?' );
                    }
                    else
                    {
                        if ( success === 'true' )
                        {
                            if ( users !== 1 )
                            {
                                botText = 'Searching for active users....  ';

                                botText += `${to} tipped Ð${soakTotal} and is soaking ${users} people with Ð${soakAmount} each! : `;

                                dcMasterList[ to ]  = dcMasterList[ to ] - soakTotal;

                                for ( i = 0, lenI = list.length; i < lenI; i++)
                                {
                                    if ( list[ i ] !== _to )
                                    {
                                        if ( dcMasterList[ list[ i ] ] )
                                        {
                                            dcMasterList[ list[ i ] ] = dcMasterList[ list[ i ] ] + soakAmount;
                                        }
                                        else
                                        {
                                            dcMasterList[ list[ i ] ] = soakAmount;
                                        }
                                        botText += `${list[ i ]}, `;
                                    }
                                }
                                botText = botText.slice( 0, botText.length - 2 );

                                if ( soakRemainder !== 0 )
                                {
                                    dcMasterList[ _bot.name ] = dcMasterList[ _bot.name ] + soakRemainder;
                                    botText += ` (Ð${soakRemainder} in scraps eaten by ${_bot.name})`;
                                }
                            }
                            else
                            {
                                dcMasterList[ to ]  = dcMasterList[ to ] - soakTotal;
                                for ( i = 0; i < list.length; i++ )
                                {
                                    if ( list[ i ] !== to )
                                    {
                                        dcMasterList[ list[ i ] ] = dcMasterList[ list[ i ] ] + soakAmount;
                                        botText = `${to} tipped Ð${soakAmount} to ${list[ i ]}`;
                                    }
                                }

                                botText += '. It\'s not soaking if there\'s just one person!';
                            }
                            self.writeMasterList();
                        }
                        else
                        {
                            _botText = 'you must be identified to access your Doge';

                            if ( userConfig.enablePM )
                            {
                                _botText += ` (/msg ${userConfig.nickservBot} help)`;
                            }
                        }
                    }
                }

                resolve( botText );
            };

            _modules.core.userData( to, from, _soakCB, text );
        } );
    }



    startTicker()
    {
        if ( !this.dogeTicker )
        {
            const {
                _modules,
                _bot,
                userConfig
            } = this;

            const {
                dogeTickerChannel,
                dogeTickerAccount,
                dogeTickerTimeout
            } = userConfig;

            const accounts = Array.isArray(dogeTickerAccount) ? dogeTickerAccount : [dogeTickerAccount];

            const res = Promise.all(accounts.map(acct =>
            {
                return new Promise( ( resolve, reject ) =>
                {
                    _modules.core.apiGet( `https://chain.so/api/v2/address/DOGE/${acct}`, res =>
                    {
                        resolve( res.data ? res.data.balance : 0);
                    }, true, dogeTickerChannel, _bot.name );
                } )
            })).then(walletContents =>
                walletContents.reduce((a, b) => parseFloat(a) + parseFloat(b), 0))
            .then(a => `${a}`);

            res.then(amount =>
            {
                setTimeout( () =>
                {
                    _bot.say( dogeTickerChannel, `Ticker started to report once every ${dogeTickerTimeout} minutes.  Use stopTicker to stop` ); // eslint-ignore-line

                    const text = this.doge( dogeTickerChannel, _bot.name, amount, true );
                    text.then( t => _bot.say( dogeTickerChannel, t ) );
                }, 30000 );

                this.dogeTicker = setInterval( () =>
                {
                    const text = this.doge( dogeTickerChannel, _bot.name, amount, true );
                    text.then( t => _bot.say( dogeTickerChannel, t ) )
                }, dogeTickerTimeout * 1000 * 60 );
            } );
        }
        else
        {
            return 'Ticker alreacy running.  Please stop the ticker then restart it (if necessary)'; // eslint-ignore-line
        }
    }


    stopTicker()
    {
        const channel       = this.userConfig.dogeTickerChannel;
        const _bot          = this._bot;

        clearInterval( this.dogeTicker );
        _bot.say( channel, `Doge ticker stopped` );
    }


    /**
     * ## tip
     *
     * moves a specified amount from one user to another after nickserv authentication
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text message text
     * @param {Array} textArr text broken into an array of words
     * @param {String} command text that triggered the bot
     * @param {Object} confObj configuration object
     *
     * @return {Promise} tip result
     */
    tip( from, to, text, textArr, command, confObj )
    {
        const _modules      = this._modules;
        const userConfig    = this.userConfig;

        return new Promise( ( resolve, reject ) =>
        {
            const self = this;
            const _bot = this._bot;

            var _tipCB = function( _to, success, textSplit, origText )
            {
                _to = _to.toLowerCase();

                var origTextSplit = origText.split( ' ' );

                var reciever        = origTextSplit[ 0 ],
                    amount          = origTextSplit[ 1 ],
                    balance         = Math.floor( dcMasterList[ to ] );

                if ( ! reciever || ! amount || parseInt( amount ) != amount || isNaN( amount ) )
                {
                    resolve( `invalid tip syntax ( ${userConfig.trigger}tip <user> <amount> )` );
                }
                else if ( balance < amount )
                {
                    resolve( `sorry ${to}, you need more Doge` );
                }
                else if ( amount < 1 )
                {
                    resolve( `stay positive, ${to}` );
                }
                else if ( to === reciever )
                {
                    resolve( `don't tip yourself in public` );
                }
                else if ( amount < 1 )
                {
                    resolve( `sorry ${to}, you must send at least Ð1` );
                }
                else
                {
                    var _botText;

                    if ( success === 'true' )
                    {
                        amount = parseInt( amount );

                        dcMasterList[ _to ]  = dcMasterList[ _to ]  - amount;

                        if ( reciever !== _bot.name )
                        {
                            dcMasterList[ reciever.toLowerCase() ] = ( dcMasterList[ reciever.toLowerCase() ] ) ?
                                                                            dcMasterList[ reciever.toLowerCase() ] + amount : amount;
                        }
                        else
                        {
                            dcMasterList.___bank___ = dcMasterList.___bank___ + amount;
                        }

                        self.writeMasterList();

                        _botText = `WOW! ${to} tipped ${reciever} such Ð${amount}`;

                        if ( reciever === _bot.name )
                        {
                            setTimeout( () => _bot.say( from, 'Thanks!', confObj ), 3000 );
                        }
                    }
                    else
                    {
                        _botText = 'you must be identified to access your Doge';
                    }

                    resolve( _botText );
                }
            };

            _modules.core.userData( to, from, _tipCB, text );
        } );
    }


    withdraw( from, to, text )
    {
        // return new Promise( ( resolve, reject ) =>
        // {
        //     var _withdrawCB = function( from, _to, _info, _whois )
        //     {
        //         var textSplit           = text.split( ' ' ).slice( 1 );
        //         var _outgoingAddress    = textSplit[ 0 ];
        //         var balance             = Math.floor( _info.data.available_balance );
        //         var _sendAmount         = textSplit[ 1 ] || balance;

        //         if ( !_outgoingAddress ||
        //             _outgoingAddress.slice( 0, 1 ) !== 'D' ||
        //             _outgoingAddress.length !== 34 ||
        //             ( _sendAmount && parseInt( _sendAmount ) != _sendAmount ) )
        //         {
        //             resolve( 'invalid syntax. ' + ( userConfig.trigger ) + 'withdraw <address> [ <amount> ]' );
        //         }
        //         else if ( balance < _sendAmount )
        //         {
        //             resolve( 'sorry ' + ( to ) + ', you need more Doge' );
        //         }
        //         else if ( _sendAmount < 2 )
        //         {
        //             resolve( 'sorry ' + ( to ) + ', you must send at least Ð2' );
        //         }
        //         else
        //         {
        //             url = 'https://block.io/api/v1/withdraw_from_labels/?api_key=' + dcMasterList[ 'api-key' ] + '&from_labels=' + ( _whois.host ) + '&payment_address=' + _outgoingAddress + '&amount=' + _sendAmount + '&pin=' + ( userConfig.api );
        //             _modules.core.apiGet( url, function( info )
        //             {
        //                 console.log( info, info.data, info.data.txid );
        //                 resolve( 'Doge sent. https://dogechain.info/tx/' + info.data.txid );
        //             }, from, to );
        //         }
        //     };

        //     _modules.core.userData( fro from,m, to, _withdrawCB );
        // } );

        // resolve( 'deposit and withdraw are in between APIs at the moment.  Ask mouse for more info' );

        return 'deposit and withdraw are in between APIs at the moment.  Ask mouse for more info';
    }


    /**
     * ## writeMasterList
     *
     * saves the json to the master bank list
     *
     * @return {Void}
     */
    writeMasterList()
    {
        var jsonMasterList = JSON.stringify( dcMasterList );

        fs.writeFile( './json/dcMasterList.json', jsonMasterList, function ( err )
        {
            return console.log( err );
        });
    }
};

module.exports = Doge
