
module.exports = function Doge( _bot, _modules, userConfig )
{
    var http            = userConfig.req.http;
    var https           = userConfig.req.https;
    var fs              = userConfig.req.fs;

    var dcMasterList    = {};

    return {

        /**
         * Balance
         *
         * returns a users balance
         *
         * @param {String} from originating channel
         * @param {String} to user
         * @param {String} text full message text
         *
         * @return _Void_
         */
        balance : function( from, to, text )
        {
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

                        if ( _to === 'masterTotal' )
                        {
                            botText += 'There are currently Ð' + amount + ' in circulation';
                        }
                        else if ( _to === '___bank___' )
                        {
                            botText += 'There are currently Ð' + amount + ' in the bank';
                        }
                        else
                        {
                            if ( from !== _to )
                            {
                              botText += to + ', ';
                            }
                            botText += 'you currently have Ð' + amount;
                        }

                        resolve( botText );
                    }
                };

                if ( text.split( ' ' )[ 1 ] === 'all' )
                {
                    _balanceCB( 'masterTotal', true );
                }
                else if ( text.split( ' ' )[ 1 ] === 'bank' )
                {
                    _balanceCB( '___bank___', true );
                }
                else
                {
                    _modules.core.userData( to, from, _balanceCB, text );
                }
            } );
        },


        deposit : function( from, to, text )
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
        },


        /**
         * Doge
         *
         * returns satoshi value of 1 doge
         *
         * @param {String} from originating channel
         *
         * @return _Void_
         */
        doge : function( from, text, full, to )
        {
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
                    var price, amount = parseInt( textSplit[ 1 ] );

                    if ( typeof amount !== 'number' || isNaN( amount ) === true )
                    {
                        amount = 1;
                    }

                    var res         = info.result[0];
                    var dogeBase    = res.Last;
                    var lastPrice   = amount * toSatoshi( res.Last );
                    var doge        = '狗狗币!  Ð' + amount + ' = ' + lastPrice + ' Satoshi';

                    if ( full )
                    {
                        url = 'https://btc-e.com/api/3/ticker/btc_usd-btc_eur-ltc_btc';

                        _modules.core.apiGet( url, function( info )
                        {
                            var formatPrice = function( price )
                            {
                                price = ( price * dogeBase * amount );
                                return price > 1 ? price.toFixed( 2 ) : price.toFixed( 4 );
                            };

                            var usd = formatPrice( info.btc_usd.last );
                            var eur = formatPrice( info.btc_eur.last );
                            var ltc = formatPrice( 1 / info.ltc_btc.last );

                            doge += ', $' + usd + ', ' + eur + '€, ' + ltc + ' LTC.';

                            resolve( doge );
                        }, true, from, to )
                    }
                    else
                    {
                        var highPrice   = amount * toSatoshi( res.High );
                        var lowPrice    = amount * toSatoshi( res.Low );
                        doge += '. TO THE MOON!!!! ( H: ' + highPrice + ', L: ' + lowPrice + ' )';

                        resolve( doge );
                    }
                }, true, from, to );
            } );
        },


        /**
         * sends prize money from the bank
         *
         * @param  {String} to who to transfer doge to
         * @param  {Number} amount amount to transfer
         * @param  {String} silent silent or spoken
         *
         * @return _String_
         */
        giveFromBank : function( to, amount, silent )
        {
            silent = silent || false;

            dcMasterList[ to.toLowerCase() ]  = dcMasterList[ to.toLowerCase() ]  + amount || amount;
            dcMasterList.___bank___  = dcMasterList.___bank___  - amount;

            this.writeMasterList();

            if ( silent )
            {
                return '';
            }

            return to + ' earns such Ð' + amount;
        },


        /**
         * Doge init
         *
         * sets the active listener and loads the dogecoin bank
         *
         * @return _Void_
         */
        ini : function()
        {
            this.loadMasterList();
        },


        /**
         * Load Master List
         *
         * loads the json for the master bank list
         *
         * @return _Void_
         */
        loadMasterList : function()
        {
            var url = 'json/dcMasterList.json';

            dcMasterList = JSON.parse( fs.readFileSync( url ) );
        },


        /**
         * dogecoin module responses
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
        responses : function( from, to, text, botText, command, confObj )
        {
            switch ( command )
            {
                case 'doge':
                    return this.doge( from, text, false, to );

                case 'market':
                    return this.doge( from, text, true, to );

                case 'tip':
                    return this.tip( from, to, text );

                case 'withdraw':
                    return this.withdraw( from, to, text );

                case 'balance':
                case 'wallet':
                    return this.balance( from, to, text );

                case 'deposit':
                    return this.deposit( from, to, text );

                case 'makeitrain':
                case 'soak':
                    return this.soak( from, to, text );
            }

            return botText;
        },


        /**
         * SOAK!
         *
         * takes a tip and splits it up between all active users after nickserv authentication
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         *
         * @return _Void_
         */
        soak : function( from, to, text )
        {
            var i, lenI, self  = this;
            var list            = _modules.core.checkActive( from, to, text, false );
            var users           = list.length - 1;
            var textSplit       = text.split( ' ' );
            var soakTotal       = parseInt( textSplit[1] );
            var soakAmount      = Math.floor( soakTotal / users );
            var soakRemainder   = soakTotal - ( soakAmount * users );

            return new Promise( ( resolve, reject ) =>
            {
                var _soakCB = function( _to, success, textSplit, origText )
                {
                    _to = _to.toLowerCase();

                    if ( !dcMasterList[ _to ] || dcMasterList[ _to ] < soakTotal )
                    {
                        botText = 'Sorry, ' + to + ', you need more doge';
                    }
                    else if ( soakTotal < 1 )
                    {
                        botText = 'Don\'t be so down, ' + to + '...  Stay positive!';
                    }
                    else
                    {
                        if ( ! text[1] || typeof soakTotal !== 'number' || isNaN( soakTotal ) )
                        {
                            botText  = 'you must give an amount ( ' + ( userConfig.trigger ) + 'soak <amount> )';
                        }
                        else if ( users === 0 )
                        {
                            botText  = 'so, you just want to soak yourself then?';
                        }
                        else
                        {
                            if ( success === 'true' )
                            {
                                if ( users !== 1 )
                                {
                                    botText = 'Searching for active users....  ';

                                    botText += to + ' tipped Ð' + soakTotal + ' and is soaking ' + users +
                                            ' people with Ð' + soakAmount + ' each! : ';

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
                                            botText += list[ i ] + ', ';
                                        }
                                    }
                                    botText = botText.slice( 0, botText.length - 2 );

                                    if ( soakRemainder !== 0 )
                                    {
                                        dcMasterList[ userConfig.botName ] = dcMasterList[ userConfig.botName ] + soakRemainder;
                                        botText += ' (Ð' + soakRemainder + ' in scraps eaten by ' + userConfig.botName + ')';
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
                                            botText = to + ' tipped Ð' + soakAmount + ' to ' + list[ i ];
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
                                    _botText += ' (/msg ' + ( userConfig.nickservBot ) + ' help)';
                                }
                            }
                        }
                    }

                    resolve( botText );
                };

                _modules.core.userData( to, from, _soakCB, text );
            } );
        },


        /**
         * tip
         *
         * moves a specified amount from one user to another after nickserv authentication
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         *
         * @return _Void_
         */
        tip : function( from, to, text )
        {
            return new Promise( ( resolve, reject ) =>
            {
                var self = this;

                var _tipCB = function( _to, success, textSplit, origText )
                {
                    _to = _to.toLowerCase();

                    var origTextSplit = origText.split( ' ' );

                    var reciever        = origTextSplit[ 1 ],
                        amount          = origTextSplit[ 2 ],
                        balance         = Math.floor( dcMasterList[ to ] );

                    if ( ! reciever || ! amount || parseInt( amount ) != amount || isNaN( amount ) )
                    {
                        resolve( `invalid tip syntax ( ${userConfig.trigger} tip <user> <amount> )` );
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

                            if ( reciever !== userConfig.botName )
                            {
                                dcMasterList[ reciever.toLowerCase() ] = ( dcMasterList[ reciever.toLowerCase() ] ) ?
                                                                                dcMasterList[ reciever.toLowerCase() ] + amount : amount;
                                // if ( userConfig.enablePM )
                                // {
                                    // _bot.say( reciever,   `Such ${to} tipped you Ð${amount} (to claim /msg ${userConfig.botName})` );
                                // }
                            }
                            else
                            {
                                dcMasterList.___bank___ = dcMasterList.___bank___ + amount;
                            }

                            self.writeMasterList();

                            _botText = `WOW! ${to} tipped ${reciever} such Ð${amount}`;

                            if ( reciever === userConfig.botName )
                            {
                                setTimeout( function(){ resolve( 'Thanks!' ); }, 5000 );
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
        },


        withdraw : function( from, to, text )
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

            resolve( 'deposit and withdraw are in between APIs at the moment.  Ask mouse for more info' );
        },


        /**
         * write Master List
         *
         * saves the json to the master bank list
         *
         * @return _Void_
         */
        writeMasterList : function()
        {
            var jsonMasterList = JSON.stringify( dcMasterList );

            fs.writeFile( './json/dcMasterList.json', jsonMasterList, function ( err )
            {
                return console.log( err );
            });
        }
    };
};
