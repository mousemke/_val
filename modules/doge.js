
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
         * @param  {str}            from                originating channel
         * @param  {str}            to                  user
         * @param  {str}            text                full message text
         *
         * @return {void}
         */
        balance : function( from, to, text )
        {
            var _balanceCB = function( _to, success )
            {
                if ( success )
                {
                    var amount      = dcMasterList[ _to ];
                    amount          = ( amount ) ? amount : 0;

                    var botText     = '';

                    if ( _to === 'masterTotal' )
                    {
                        botText += 'There are currently Ð' + amount + ' in circulation';
                    }
                    else
                    {
                        if ( from !== _to )
                        {
                          botText += _to + ', ';
                        }
                        botText += 'you currently have Ð' + amount;
                    }

                    _bot.say( from, botText );
                }
            };

            if ( text.split( ' ' )[ 1 ] === 'all' )
            {
                _balanceCB( 'masterTotal', true );
            }
            else
            {
                _modules.core.userData( to, from, _balanceCB, text );
            }
        },


        deposit : function( from, to, text )
        {
            // var _depositCB = function( from, _to, _info, _whois )
            // {
            //      var botText = '';
            //      if ( from !== _to )
            //      {
            //          botText += _to + ', ';
            //      }
            //
            //      botText += 'please deposit your Ð to ' + dcMasterList[ _whois.host ];
            //
            //     _bot.say( from, botText );
            // };

            // _modules.core.userData( from, to, _depositCB );
            //

            _bot.say( to, 'deposit and withdraw are in between APIs at the moment.  Ask mouse for more info' );
        },


        /**
         * Doge
         *
         * returns satoshi value of 1 doge
         *
         * @param  {str}                    from                originating channel
         *
         * @return {void}
         */
        doge : function( from, text, full )
        {
            var textSplit = text.split( ' ' );

            var url = 'https://block.io/api/v1/get_current_price/?api_key=' + dcMasterList[ 'api-key' ];
            _modules.core.apiGet( url, function( info )
            {
                var price, dogePrices = info.data.prices,
                    amount = parseInt( textSplit[ 1 ] );

                if ( typeof amount !== 'number' || isNaN( amount ) === true )
                {
                    amount = 1;
                }

                var doge = '狗狗币!  Ð' + amount + ' =';

                if ( full === true )
                {
                    doge += ' [ ';
                }
                else
                {
                    doge += ' ';
                }

                for ( var i = 0, lenI = dogePrices.length; i < lenI; i++ )
                {
                    if ( ( dogePrices[ i ].price_base === 'BTC' &&
                         dogePrices[ i ].exchange === 'cryptsy' && full === false ) ||
                        ( full === true ) )
                    {
                        price = dogePrices[ i ].price * amount;
                        if ( dogePrices[ i ].price_base === 'BTC' && dogePrices[ i ].exchange === 'cryptsy' )
                        {
                            price = Math.floor( price  * 100000000 );

                            if ( full === true )
                            {
                                 price += ' (Satoshi), ';
                            }
                            else
                            {
                                price += ' satoshi';
                            }
                        }
                        else if ( dogePrices[ i ].price_base === 'USD' && dogePrices[ i ].exchange === 'cryptsy' )
                        {
                            price = price + ' (' + ( dogePrices[ i ].price_base ) + '), ';
                        }
                         else if ( dogePrices[ i ].price_base === 'EUR' )
                        {
                            price = ( price * 1000 ) + ' (' + ( dogePrices[ i ].price_base ) + '), ';
                        }
                        else if ( dogePrices[ i ].price_base !== 'BTC' &&
                            dogePrices[ i ].price_base !== 'USD' &&
                            dogePrices[ i ].price_base !== 'EUR' )
                        {
                            price = price + ' (' + ( dogePrices[ i ].price_base ) + '), ';
                        }
                        else
                        {
                            price = '';
                        }

                        doge += price;
                    }
                }
                if ( full === false )
                {
                    doge += '. TO THE MOON!!!!';
                }
                else
                {
                    doge = doge.slice( 0, doge.length - 2 ) + ' ]';
                }

                _bot.say( from, doge );
            } );
        },


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
         * @return {void}
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
         * @return {void}
         */
        loadMasterList : function()
        {
            var url = '/_val/json/dcMasterList.json';

            http.get( url, function( res )
            {
                 var body = '', _json = '';

                res.on( 'data', function( chunk )
                {
                    body += chunk;
                });

                res.on( 'end', function()
                {
                    dcMasterList =  JSON.parse( body );
                });

            } ).on( 'error', function( e )
            {
                console.log( 'Got error: ', e );
            });
        },


        /**
         * dogecoin module responses
         *
         * @param  {str}            from                originating channel
         * @param  {str}            to                  originating user
         * @param  {str}            text                full message text
         * @param  {str}            botText             old botText
         *
         * @return {str}                                        new botText
         */
        responses : function( from, to, text, botText )
        {
            var command = text.slice( 1 ).split( ' ' )[ 0 ];

            switch ( command )
            {
                case 'doge':
                    this.doge( from, text, false );
                    break;
                case 'market':
                    this.doge( from, text, true );
                    break;
                case 'tip':
                    this.tip( from, to, text );
                    break;
                case 'withdraw':
                    this.withdraw( from, to, text );
                    break;
                case 'balance':
                case 'wallet':
                    this.balance( from, to, text );
                    break;
                case 'deposit':
                    this.deposit( from, to, text );
                    break;
                case 'soak':
                    this.soak( from, to, text );
                    break;
            }

            return botText;
        },


        /**
         * SOAK!
         *
         * takes a tip and splits it up between all active users after nickserv authentication
         *
         * @param  {str}            from                originating channel
         * @param  {str}            to                  originating user
         * @param  {str}            text                full message text
         *
         * @return {void}
         */
        soak : function( from, to, text )
        {
            var i, lenI, scope  = this;
            var list            = _modules.core.checkActive( from, to, text, false );
            var users           = list.length - 1;
            var textSplit       = text.split( ' ' );
            var soakTotal       = parseInt( textSplit[1] );
            var soakAmount      = Math.floor( soakTotal / users );
            var soakRemainder   = soakTotal - ( soakAmount * users );


            var _soakCB = function( _to, success, textSplit, origText )
            {
                if ( dcMasterList[ to ] < soakTotal )
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

                                botText += to + ' tipped Ð' + soakAmount + ' and is soaking ' + users +
                                        ' people with Ð' + soakAmount + ' each! : ';

                                dcMasterList[ to ]  = dcMasterList[ to ] - soakTotal;

                                for ( i = 0, lenI = list.length; i < lenI; i++)
                                {
                                    if ( list[ i ] !== to )
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
                            scope.writeMasterList();
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

                _bot.say( from, botText );
            };

            _modules.core.userData( to, from, _soakCB, text );
        },


        /**
         * tip
         *
         * moves a specified amount from one user to another after nickserv authentication
         *
         * @param  {str}            from                originating channel
         * @param  {str}            to                  originating user
         * @param  {str}            text                full message text
         *
         * @return {void}
         */
        tip : function( from, to, text )
        {
            var scope = this;

            var _tipCB = function( _to, success, textSplit, origText )
            {
                var origTextSplit = origText.split( ' ' );

                var reciever        = origTextSplit[ 1 ],
                    amount          = origTextSplit[ 2 ],
                    balance         = Math.floor( dcMasterList[ to ] );

                if ( ! reciever || ! amount || parseInt( amount ) != amount || isNaN( amount ) )
                {
                    _bot.say( from, 'invalid tip syntax ( ' + ( userConfig.trigger ) + 'tip <user> <amount> )' );
                }
                else if ( balance < amount )
                {
                    _bot.say( from, 'sorry ' + to + ', you need more Doge' );
                }
                else if ( amount < 1 )
                {
                    _bot.say( from, 'stay positive, ' + to );
                }
                else if ( to === reciever )
                {
                    _bot.say( from, 'don\'t tip yourself in public' );
                }
                else if ( amount < 1 )
                {
                    _bot.say( from, 'sorry ' + to + ', you must send at least Ð1' );
                }
                else
                {
                    var _botText;

                    if ( success === 'true' )
                    {
                        amount = parseInt( amount );

                        dcMasterList[ to.toLowerCase() ]  = dcMasterList[ to.toLowerCase() ]  - amount;

                        if ( reciever !== userConfig.botName )
                        {
                            dcMasterList[ reciever.toLowerCase() ] = ( dcMasterList[ reciever.toLowerCase() ] ) ? dcMasterList[ reciever.toLowerCase() ] + amount : amount;
                            if ( userConfig.enablePM )
                            {
                                _bot.say( reciever,   'Such ' + to + ' tipped you Ð' + amount + ' (to claim /msg ' + ( userConfig.botName ) + ' help)' );
                            }
                        }
                        else
                        {
                            dcMasterList.___bank___ = dcMasterList.___bank___ + amount;
                        }

                        scope.writeMasterList();

                        _botText = 'WOW! ' + to + ' tipped ' + reciever + ' such Ð' + amount;

                        if ( userConfig.enablePM )
                        {
                            _botText += ' (to claim /msg ' + ( userConfig.botName ) + ' help)';
                        }

                        if ( reciever === userConfig.botName )
                        {
                            setTimeout( function(){ _bot.say( from, 'Thanks!' ); }, 5000 );
                        }
                    }
                    else
                    {
                        _botText = 'you must be identified to access your Doge';

                        if ( userConfig.enablePM )
                        {
                            _botText += ' (/msg ' + ( userConfig.nickservBot ) + ' help)';
                        }
                    }

                    _bot.say( from, _botText );
                }
            };

            _modules.core.userData( to, from, _tipCB, text );
        },


        withdraw : function( from, to, text )
        {
            // var _withdrawCB = function( from, _to, _info, _whois )
            // {
            //     var textSplit           = text.split( ' ' ).slice( 1 );
            //     var _outgoingAddress    = textSplit[ 0 ];
            //     var balance             = Math.floor( _info.data.available_balance );
            //     var _sendAmount         = textSplit[ 1 ] || balance;

            //     if ( !_outgoingAddress ||
            //         _outgoingAddress.slice( 0, 1 ) !== 'D' ||
            //         _outgoingAddress.length !== 34 ||
            //         ( _sendAmount && parseInt( _sendAmount ) != _sendAmount ) )
            //     {
            //         _bot.say( from, 'invalid syntax. ' + ( userConfig.trigger ) + 'withdraw <address> [ <amount> ]' );
            //     }
            //     else if ( balance < _sendAmount )
            //     {
            //         _bot.say( from, 'sorry ' + ( to ) + ', you need more Doge' );
            //     }
            //     else if ( _sendAmount < 2 )
            //     {
            //         _bot.say( from, 'sorry ' + ( to ) + ', you must send at least Ð2' );
            //     }
            //     else
            //     {
            //         url = 'https://block.io/api/v1/withdraw_from_labels/?api_key=' + dcMasterList[ 'api-key' ] + '&from_labels=' + ( _whois.host ) + '&payment_address=' + _outgoingAddress + '&amount=' + _sendAmount + '&pin=' + ( userConfig.api );
            //         _modules.core.apiGet( url, function( info )
            //         {
            //             console.log( info, info.data, info.data.txid );
            //             _bot.say( from, 'Doge sent. https://dogechain.info/tx/' + info.data.txid );
            //         } );
            //     }
            // };

            // _modules.core.userData( fro from,m, to, _withdrawCB );

            _bot.say( to, 'deposit and withdraw are in between APIs at the moment.  Ask mouse for more info' );
        },


        /**
         * write Master List
         *
         * saves the json to the master bank list
         *
         * @return {void}
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
