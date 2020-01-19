// https://tenor.com/gifapi/documentation
const Module = require('./Module.js');

class Tenor extends Module {
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

    this.apikey = userConfig.tenorAPIKey;
    this.anonId = userConfig.tenorAnonId;
    this.limit = userConfig.tenorLimit;
  }

  /**
   * ## getGif
   *
   * pulls in a gif from tenor (or more than one and chooses randomly)
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {Sring} text original text minus command
   *
   * @return {String} gif url
   */
  getGif(from, to, text) {
    text = text
      .replace(/ /g, ',')
      .toLowerCase()
      .replace(/['"`’]/g, '');

    const options = {
      path: `/v1/search?tag=${text}&key=${this.apikey}&limit=${this.limit}&anon_id=${this.anonId}`,
      host: 'api.tenor.com',
      port: 443,
    };

    return new Promise((resolve, reject) => {
      this._modules.core.apiGet(
        options,
        res => {
          const images = res.results;
          const imageCount = images.length;

          if (imageCount) {
            const pickImage = () => {
              const randomIndex = Math.floor(Math.random() * imageCount) - 1;

              return images[randomIndex].media;
            };

            const file = pickImage();

            resolve(file[0].mediumgif.url);
          } else {
            resolve('Nah.... I got nothing');
          }
        },
        true,
        from,
        to
      );
    });
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
        gif: {
          f: this.getGif,
          desc: 'finds a gif matching the passed query',
          syntax: [`${trigger}gif <query>`],
        },
      },
    };
  }
}

module.exports = Tenor;
