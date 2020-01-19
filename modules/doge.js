const http = require('http');
const https = require('https');
const fs = require('fs');
const Module = require('./Module.js');

let dcMasterList = {};

class Doge extends Module {
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
  balance(from, to, text) {
    const _modules = this._modules;

    return new Promise((resolve, reject) => {
      var _balanceCB = function(_to, success) {
        _to = _to.toLowerCase();

        if (success) {
          var amount = dcMasterList[_to];
          amount = amount ? amount : 0;

          var botText = '';

          if (_to === 'mastertotal' || _to === '___bank___') {
            resolve('');
          } else {
            if (from !== _to) {
              botText += `${to}, `;
            }

            botText += `you currently have Ð${amount}`;

            resolve(botText);
          }
        }
      };

      if (text.split(' ')[0] === 'all') {
        _balanceCB('masterTotal', true);
      } else if (text.split(' ')[0] === 'bank') {
        _balanceCB('___bank___', true);
      } else {
        _modules.core.userData(to, from, _balanceCB, text);
      }
    });
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
  constructor(_bot, _modules, userConfig, commandModule) {
    super(_bot, _modules, userConfig, commandModule);

    this.loadMasterList();
  }

  deposit(from, to, text) {
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
  giveFromBank(to, amount, silent) {
    silent = silent || false;

    dcMasterList[to.toLowerCase()] =
      dcMasterList[to.toLowerCase()] + amount || amount;
    dcMasterList.___bank___ = dcMasterList.___bank___ - amount;

    this.writeMasterList();

    if (silent) {
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
  loadMasterList() {
    var url = 'json/dcMasterList.json';

    dcMasterList = JSON.parse(fs.readFileSync(url));
  }

  /**
   * ## responses
   *
   * @return {Object} responses
   */
  responses() {
    const { trigger } = this.userConfig;

    return {
      commands: {
        tip: {
          f: this.tip,
          desc: 'tip someone',
          syntax: [`${trigger}tip <user> <amount>`],
        },

        withdraw: {
          f: this.withdraw,
          desc: 'withdraw some doge to an external wallet',
          syntax: [`${trigger}withdraw <amount>`],
        },

        balance: {
          f: this.balance,
          desc: 'returns a users balance',
          syntax: [
            `${trigger}balance`,
            `${trigger}balance bank`,
            `${trigger}balance all`,
          ],
        },

        deposit: {
          f: this.deposit,
          desc: 'deposit money doge in from an external wallet',
          syntax: [`${trigger}deposit <amount>`],
        },

        makeitrain: {
          f: this.soak,
          desc: 'tip all active users',
          syntax: [`${trigger}makeitrain <amount>`],
        },

        soak: {
          f: this.soak,
          desc: 'tip all active users',
          syntax: [`${trigger}soak <amount>`],
        },
      },
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
  soak(from, to, text) {
    var i,
      lenI,
      self = this;
    const _modules = this._modules;
    const _bot = this._bot;
    const userConfig = this.userConfig;

    var list = _modules.core.checkActive(from, to, text, false);
    const users = list.length - 1;
    var textSplit = text.split(' ');
    var soakTotal = parseInt(textSplit[0]);
    var soakAmount = Math.floor(soakTotal / users);
    var soakRemainder = soakTotal - soakAmount * users;
    let botText = '';

    return new Promise((resolve, reject) => {
      var _soakCB = function(_to, success, textSplit, origText) {
        _to = _to.toLowerCase();

        if (!dcMasterList[_to] || dcMasterList[_to] < soakTotal) {
          resolve(`Sorry, ${to}, you need more doge`);
        } else if (soakTotal < 1) {
          resolve(`Don't be so down, ${to}...  Stay positive!`);
        } else {
          if (!text[1] || typeof soakTotal !== 'number' || isNaN(soakTotal)) {
            resolve(
              `you must give an amount ( ${userConfig.trigger}soak <amount> )`
            );
          } else if (users === 0) {
            resolve('so, you just want to soak yourself then?');
          } else {
            if (success === 'true') {
              botText = 'Searching for active users....  ';

              if (users !== 1) {
                botText += `${to} tipped Ð${soakTotal} and is soaking ${users} people with Ð${soakAmount} each! : `;
              }

              dcMasterList[to] = dcMasterList[to] - soakTotal;

              for (i = 0, lenI = list.length; i < lenI; i++) {
                if (list[i] !== _to) {
                  if (dcMasterList[list[i]]) {
                    dcMasterList[list[i]] = dcMasterList[list[i]] + soakAmount;
                  } else {
                    dcMasterList[list[i]] = soakAmount;
                  }

                  if (users !== 1) {
                    botText += `${list[i]}, `;
                  } else {
                    botText = `${to} tipped Ð${soakAmount} to ${list[i]}`;
                    botText += ". It's not soaking if there's just one person!";
                  }
                }
              }

              if (users !== 1) {
                botText = botText.slice(0, botText.length - 2);
              }

              if (soakRemainder !== 0) {
                dcMasterList[_bot.name] =
                  dcMasterList[_bot.name] + soakRemainder;
                botText += ` (Ð${soakRemainder} in scraps eaten by ${_bot.name})`;
              }

              self.writeMasterList();
            } else {
              _botText = 'you must be identified to access your Doge';

              if (userConfig.enablePM) {
                _botText += ` (/msg ${userConfig.nickservBot} help)`;
              }
            }
          }
        }

        resolve(botText);
      };

      _modules.core.userData(to, from, _soakCB, text);
    });
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
  tip(from, to, text, textArr, command, confObj) {
    const _modules = this._modules;
    const userConfig = this.userConfig;

    return new Promise((resolve, reject) => {
      const self = this;
      const _bot = this._bot;

      var _tipCB = function(_to, success, textSplit, origText) {
        _to = _to.toLowerCase();

        var origTextSplit = origText.split(' ');

        var reciever = origTextSplit[0].toLowerCase(),
          amount = parseFloat(origTextSplit[1]),
          balance = Math.floor(dcMasterList[_to]) || 0;

        if (
          !reciever ||
          !amount ||
          parseInt(amount) != amount ||
          isNaN(amount)
        ) {
          resolve(
            `invalid tip syntax ( ${userConfig.trigger}tip <user> <amount> )`
          );
        } else if (balance < amount) {
          resolve(`sorry ${to}, you need more Doge`);
        } else if (amount < 1) {
          resolve(`stay positive, ${to}`);
        } else if (_to === reciever) {
          resolve(`don't tip yourself in public`);
        } else if (amount < 1) {
          resolve(`sorry ${to}, you must send at least Ð1`);
        } else {
          var _botText;

          if (success === 'true') {
            amount = parseInt(amount);

            dcMasterList[_to] = dcMasterList[_to] - amount;

            if (reciever !== _bot.name) {
              dcMasterList[reciever] = dcMasterList[reciever]
                ? dcMasterList[reciever] + amount
                : amount;
            } else {
              dcMasterList.___bank___ = dcMasterList.___bank___ + amount;
            }

            self.writeMasterList();

            _botText = `WOW! ${to} tipped ${reciever} such Ð${amount}`;

            if (reciever === _bot.name) {
              setTimeout(() => _bot.say(from, 'Thanks!', confObj), 3000);
            }
          } else {
            _botText = 'you must be identified to access your Doge';
          }

          resolve(_botText);
        }
      };

      _modules.core.userData(to, from, _tipCB, text);
    });
  }

  withdraw(from, to, text) {
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
  writeMasterList() {
    var jsonMasterList = JSON.stringify(dcMasterList);

    fs.writeFile('./json/dcMasterList.json', jsonMasterList, function(err) {
      return console.log(err);
    });
  }
}

module.exports = Doge;
