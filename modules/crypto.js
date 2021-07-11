const http = require('http');
const https = require('https');
const fs = require('fs');
const Module = require('./Module.js');
const request = require('request');

const MARKETS =
  'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
const CURRENCY = 'EUR';
const CURRENCY_SYMBOL = '€';

let tickers = {};
let marketPrices = {};
let fiatPrices = {};
let tickerIntervals = {};
let tickerTimeouts = {};

class Crypto extends Module {
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
  activeTickers(from, to, text, textArr, command, confObj) {
    return this.tickNow(from, to, text, textArr, command, confObj);
  }

  /**
   * ## availableCoins
   *
   * lists the coins that are available for the ticker
   *
   * @return {String} available coins
   */
  availableCoins() {
    const coins = 'Available coins are:';

    return `${coins} ${Object.keys(marketPrices)
      .join(', ')
      .toUpperCase()}`;
  }

  buildTicker(channelId) {
    const { tick, userConfig, _bot } = this;
    const { cryptoTickerFrequency } = userConfig;

    clearTimeout(tickerTimeouts[channelId]);
    clearInterval(tickerIntervals[channelId]);

    if (tickers[channelId]) {
      tickerTimeouts[channelId] = setTimeout(
        () => _bot.say(channelId, tick(channelId)),
        20000
      );
      tickerIntervals[channelId] = setInterval(
        () => _bot.say(channelId, tick(channelId)),
        cryptoTickerFrequency * 1000 * 60
      );
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
  constructor(_bot, _modules, userConfig, commandModule) {
    super(_bot, _modules, userConfig, commandModule);

    const { cryptoMarketUpdateFrequency } = userConfig;

    this.updateMarket = this.updateMarket.bind(this);
    this.startTicker = this.startTicker.bind(this);
    this.tick = this.tick.bind(this);

    this.updateMarket();

    setTimeout(this.startTicker, 60000);

    this.marketInterval = setInterval(
      this.updateMarket,
      cryptoMarketUpdateFrequency * 1000 * 60
    );
  }

  fixed2(num) {
    let fixed = `${parseInt(num * 100) / 100}`;

    const decimal = fixed.split('.')[1];

    if (!decimal || decimal.length === 1) {
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
  loadTickerList() {
    const botName = this._bot.name;
    const url = `json/tickers/tickers.${botName}.json`;

    try {
      tickers = JSON.parse(fs.readFileSync(url, 'utf8'));
    } catch (e) {
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
  market(from, to, text, textArr) {
    const coin = textArr[0].toLowerCase();
    const amount = parseFloat(textArr[1]);

    let botText = '';

    if (!coin || isNaN(amount)) {
      return 'invalid syntax';
    }

    if (!marketPrices[coin]) {
      const { trigger } = this.userConfig;

      return `invalid coin abbreviation.  check ${trigger}availableCoins for available coins`;
    }

    const value = amount * marketPrices[coin];

    return `${amount} ${coin.toUpperCase()} = ${this.fixed2(
      value
    )}${CURRENCY_SYMBOL}`;
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
        activeTickers: {
          f: this.activeTickers,
          desc: 'lists the tickers that are active for this channel',
          syntax: [`${trigger}activeTickers`],
        },

        availableCoins: {
          f: this.availableCoins,
          desc: 'lists the coins available for tickers',
          syntax: [`${trigger}availableCoins`],
        },

        market: {
          f: this.market,
          desc: `returns the price of a certain amount of a single coin in ${CURRENCY}`,
          syntax: [`${trigger}market <coin> <amount>`],
        },

        removeTicker: {
          f: this.setTicker,
          desc: 'adds or removes a coin in the ticker',
          syntax: [`${trigger}setTicker <coin> <amount>`],
        },

        setTicker: {
          f: this.setTicker,
          desc: 'adds or removes a coin in the ticker',
          syntax: [`${trigger}setTicker <coin> <?amount>`],
        },

        tickNow: {
          f: this.tickNow,
          desc: 'reports the channel ticker now',
          syntax: [`${trigger}tickNow`],
        },
      },
    };
  }

  /**
   * ## removeTicker
   *
   * a shortcut for setTicker with no amount
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
  removeTicker(from, to, text, textArr, command, confObj) {
    return this.setTicker(from, to, text, [textArr[0]], command, confObj);
  }

  /**
   * ## saveTickerList
   *
   * saves the json to the master ticker list
   *
   * @return {Void}
   */
  saveTickerList() {
    const botName = this._bot.name;

    const tickersJSON = JSON.stringify(tickers);
    fs.writeFileSync(
      `./json/tickers/tickers.${botName}.json`,
      tickersJSON,
      'utf8'
    );
  }

  /**
   * ## startTicker
   *
   * loads the list of tickers and starts them
   *
   * @param {String} channelId internal name for the channeö
   *
   * @return {Void}
   */
  startTicker(channelId) {
    this.loadTickerList();

    if (channelId) {
      this.buildTicker(channelId);
    } else {
      Object.keys(tickers).forEach(t => {
        this.buildTicker(t);
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
  setTicker(from, to, text, textArr, command, confObj) {
    const coin = textArr[0].toLowerCase();
    const amount = textArr[1];

    let botText = '';

    if (!coin) {
      return 'invalid syntax';
    }

    this.loadTickerList();

    const channelId = confObj.from;

    tickers[channelId] = tickers[channelId] || {};

    if (
      (!amount || amount === '0' || amount === 0) &&
      tickers[channelId][coin]
    ) {
      delete tickers[channelId][coin];

      botText = `${coin.toUpperCase()} ticker removed`;

      if (Object.keys(tickers[channelId]).length === 0) {
        delete tickers[channelId];
      }
    } else if (amount && amount !== '0' && amount !== 0) {
      if (!marketPrices[coin]) {
        const { trigger } = this.userConfig;

        return `invalid coin abbreviation.  check ${trigger}availableCoins for available coins`;
      }

      tickers[channelId][coin] = amount;

      botText = `${coin.toUpperCase()} ticker set for ${amount}`;
    }

    this.saveTickerList();
    this.startTicker(channelId);

    return botText;
  }

  tick(channelId) {
    const localTickers = tickers[channelId];

    let eurTotal = 0;
    let botText = '';

    Object.keys(localTickers).forEach(coin => {
      const coinCount = localTickers[coin];
      const coinValue = coinCount * marketPrices[coin];

      if (Number.isNaN(coinValue)) {
        botText += `|    ${coin.toUpperCase()} prices are not available\n`;
      } else {
        botText += `|    ${coin.toUpperCase()}: ${coinCount}; ${this.fixed2(
          coinValue
        )}${CURRENCY_SYMBOL}\n`;
        eurTotal += coinValue;
      }
    });

    botText += `|\n|    Total: ${this.fixed2(eurTotal)}${CURRENCY_SYMBOL}\n|`;

    return botText;
  }

  tickNow(from, to, text, textArr, command, confObj) {
    this.loadTickerList();

    const localTickers = tickers[confObj.from];

    if (!localTickers) {
      return 'there are no crypto tickers for this channel';
    }

    return this.tick(confObj.from);
  }

  updateMarket() {
    const { coinMarketCapKey } = this.userConfig;

    return new Promise((resolve, reject) => {
      const marketOptions = {
        method: 'GET',
        url: MARKETS,
        headers: {
          'X-CMC_PRO_API_KEY': coinMarketCapKey,
        },
        qs: {
          start: '1',
          convert: 'EUR',
        },
      };

      const marketCb = (error, response, market) => {
        const data = JSON.parse(market).data;

        resolve(
          Object.assign(
            {},
            ...data.map(m => ({
              [m.symbol.toLowerCase()]: m.quote['EUR'].price,
            }))
          )
        );
      };

      request(marketOptions, marketCb);
    }).then(market => {
      marketPrices = market;
    });
  }
}

module.exports = Crypto;
