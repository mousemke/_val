const Module = require('./Module.js');

const dumpWeirdChars = /[^a-zA-z0-9 -\/]/g;

const capitalize = word =>
  word
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

class Mtg extends Module {
  /**
   * ## buildPriceString
   *
   * formats a price into a price string with foil indicator
   *
   * @param {Object} cardPrice apiresult for card
   * @return {string} price string
   */
  buildPriceString(cardPrice) {
    if (!cardPrice ||!cardPrice.marketPrice) {
      return '';
    }

    const {
      marketPrice,
      subTypeName,
    } = cardPrice;

    const foil = subTypeName ==='Foil' ? '  *F* ' : '';

    return `${foil}${marketPrice}€`;
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

    this.mtg = this.mtg.bind(this);
    this.bearerToken = this.userConfig;
  }

  /**
   * ## getPrices
   *
   * retrieves, sorts, and returns the prices
   *
   * @param {string | Array} ids card printing product ids
   * @param {string} mtgApiBaseUrl base api address
   * @param {Object} headers api and auth headers
   * @param {Object} request val internal request
   *
   * @return {Promise} prices for the selected card
   */
  getGroups(ids, mtgApiBaseUrl, headers, request) {
    const joinedIds =  Array.isArray(ids) ? ids.join(',') : ids;

    const groupOptions = {
      method: 'GET',
      url: `https://${mtgApiBaseUrl}/catalog/groups/${joinedIds}?categoryId=1`,
      headers,
    };

    return new Promise((resolve, reject) => {
      const groupCb = (error, response, body) => {
        const res = JSON.parse(body).results;

        const groups = {};
        res.forEach(g => groups[g.groupId] = g);

        resolve(groups);
      };

      request(groupOptions, groupCb);
    });
  };

  /**
   * ## getPrices
   *
   * retrieves, sorts, and returns the set information
   *
   * @param {string | Array} ids card printing product ids
   * @param {string} mtgApiBaseUrl base api address
   * @param {Object} headers api and auth headers
   * @param {Object} request val internal request
   *
   * @return {Promise} prices for the selected card
   */
  getPrices(ids, mtgApiBaseUrl, headers, request) {
    const joinedIds =  Array.isArray(ids) ? ids.join(',') : ids;

    const priceOptions = {
      method: 'GET',
      url: `https://${mtgApiBaseUrl}/pricing/product/${joinedIds}`,
      headers,
    };

    return new Promise((resolve, reject) => {
      const priceCb = (error, response, body) => {
        const res = JSON.parse(body).results;

        const prices = {};
        res.forEach(card => {
          const {
            productId,
            subTypeName,
          } = card;

          if (prices[productId]) {
            prices[productId][subTypeName] = card;
          }
          else
          {
            prices[productId] = {
              [subTypeName]: card,
            };
          }
        });

        resolve(prices);
      };

      request(priceOptions, priceCb);
    });
  };

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
  mtg(from, to, text, textArr) {
    return new Promise((mtgResolve, reject) => {
      const {
        mtgApiBaseUrl,
        mtgBearerToken,
        mtgCategory,
        req,
      } = this.userConfig;

      const request = req.request;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mtgBearerToken}`,
      };

      const cleanText = text.replace(dumpWeirdChars, '');

      const postBody = JSON.stringify({
        sort: 'Sales DESC',
        limit: 10,
        offset: 0,
        filters: [
          {
            name: 'ProductName',
            values: [cleanText],
          },
          {
            name: 'Rarity',
            values: ['S', 'T', 'L', 'P', 'C', 'U', 'R', 'M'],
          },
        ],
      });

      const options = {
        method: 'POST',
        url: `https://${mtgApiBaseUrl}/catalog/categories/${mtgCategory}/search`,
        headers,
        body: postBody,
      };

      const callback = (error, response, body) => {
         if (response.statusCode === 401) {
          console.log('refreshing mtg api token....');
          mtgResolve(this.setBearerToken(this.mtg, [from, to, text, textArr]));
        } else if (body && !error && response.statusCode === 200) {
          const res = JSON.parse(body).results;

          if (!res || res.length < 1) {
            console.log(`Sorry ${to}, I didn't find anything.`);

            return null;
          }

          const itemOptions = {
            method: 'GET',
            url: `https://${mtgApiBaseUrl}/catalog/products/${res.join(
              ','
            )}?getExtendedFields=true`,
            headers,
          };

          const itemCb = (error, response, body) => {
            const res = JSON.parse(body);

            if (
              !res.results ||
              res.results.length < 1 ||
              res.success !== true
            ) {
              console.log(`Sorry ${to}, I didn't find anything.`);
            } else {


              const {
                uniqueResultNames,
                uniqueResults,
              } = this.sortCardResults(res.results);

              const match = uniqueResultNames.indexOf(cleanText);

              if (match !== -1) {
                uniqueResultNames = [uniqueResultNames[match]];
              }

              if (uniqueResultNames.length === 1) {
                const card = uniqueResults[uniqueResultNames[0]];

                Promise.all([
                  this.getPrices(card.ids, mtgApiBaseUrl, headers, request),
                  this.getGroups(card.sets, mtgApiBaseUrl, headers, request),
                ])
                  .then(res => {
                    const prices = res[0];
                    const sets = res[1];

                    let setsWithPrices = '';

                    card.printings.forEach(printing => {
                      const {
                        groupId,
                        productId,
                      } = printing;

                      const set = sets[groupId];
                      const price = prices[productId];
                      const normal = this.buildPriceString(price.Normal);
                      const foil = this.buildPriceString(price.Foil);

                      setsWithPrices += `${set.abbreviation}: ${normal}${foil}\n`;
                    });

                    const oracleText = card.oracletext
                      .replace(/<br>/gi, '\n')
                      .replace(/<\/?em>/gi, '_')
                      .replace(/<\/?b>/gi, '*');

                    mtgResolve(`${card.image}\n${card.name}\n\n${oracleText}\n\n${setsWithPrices}`);
                  });


              } else {
                mtgResolve(
                  `Can you be more specific? I found ${uniqueResultNames.join(
                    ', '
                  )}`
                );
              }
            }
          };

          request(itemOptions, itemCb);
        }
      };

      request(options, callback);
    });
  }

  /**
   * mtg responses
   */
  responses() {
    const { trigger } = this.userConfig;

    return {
      commands: {
        mtg: {
          f: this.mtg,
          desc: 'searches for a magic card by name',
          syntax: [`${trigger}mtg <query>`],
        },
      },
    };
  }

  setBearerToken(cb, arr) {
    return new Promise((resolve, reject) => {
      const { userConfig } = this;

      const {
        mtgApiBaseUrl,
        mtgApiPublicKey,
        mtgApiPrivateKey,
        mtgBearerTokenExp,
        req,
      } = userConfig;

      const request = req.request;
      const now = Date.now();

      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const postBody = `grant_type=client_credentials&client_id=${mtgApiPublicKey}&client_secret=${mtgApiPrivateKey}`;

      const options = {
        url: `https://${mtgApiBaseUrl}/token`,
        method: 'POST',
        headers,
        body: postBody,
      };

      const parseBearerToken = (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const res = JSON.parse(body);

          userConfig.mtgBearerTokenExp = now + res['expires_in'] - 10000; // 10000 buffer
          userConfig.mtgBearerToken = res['access_token'];
          resolve(cb(...arr));
        }
      };

      request(options, parseBearerToken);
    });
  }

  /**
   * ## sortCardResults
   *
   * sorts the result from the server into a more usable shape for our purposes
   *
   * @param {Object} res raw api result
   *
   * @return {Object}  { uniqueResultNames, uniqueResults }
   */
  sortCardResults(res) {
    let uniqueResultNames = [];
    const uniqueResults = {};

    res.forEach(r => {
      const cardName = r.name.split(' ').join('');
      const cardPosition = uniqueResultNames.indexOf(cardName);

      if (cardPosition === -1) {
        uniqueResultNames.push(cardName);

        uniqueResults[cardName] = {
          name: r.cleanName,
          image: r.imageUrl,
          store: r.url,
          printings: [r],
          ids: [r.productId],
          sets: [r.groupId],
        };

        r.extendedData.forEach(data => {
          uniqueResults[cardName][data.name.toLowerCase()] =
            data.value;
        });
      } else {
        uniqueResults[cardName].printings.push(r);
        uniqueResults[cardName].ids.push(r.productId);
        uniqueResults[cardName].sets.push(r.groupId);
      }
    });

    return {
      uniqueResultNames,
      uniqueResults,
    };
  }
}

module.exports = Mtg;
