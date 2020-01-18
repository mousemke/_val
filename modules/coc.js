const Module = require('./Module.js');
const fs = require('fs');

let usersAgreed = {};

class CoC extends Module {
  /**
   * ## coc
   *
   * accepts a user response
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
  coc(from, to, text, textArr, command, confObj) {
    const { admins } = this.userConfig;

    if (textArr.length === 0) {
      const {
        codeOfConductMessage,
        trigger,
      } = this.userConfig;

      if (codeOfConductMessage) {
        const adminsString = `@${admins.join(', @')}`;

        let botText = `${codeOfConductMessage}`;
        botText += `\nOnce you have read through, please agree by replying to this message with:\n${trigger}coc agree`;
        botText += `\n\nIf you have any questions about the CoC, or why it is important, feel free to reach out to an admin (${adminsString})`;

        return botText;
      }

      return '';
    }

    const response = textArr[0].toLowerCase();

    if (response === 'agree') {
      return this.setUserAgreed(from, to, text, textArr, command, confObj);
    }

    // bad response to admin?
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

    const {
      cocReminderFrequency,
      codeOfConductMessage,
    } = userConfig;

    if (codeOfConductMessage) {
      this.loadUsersAgreed();

      // this.tickCoC = this.tickCoC.bind(this);

      // this.cocInterval = setInterval(
      //   this.tickCoC,
      //   cocReminderFrequency * 1000 * 60 * 60 * 24
      // );
    }
  }

  /**
   * ## loadUsersAgreed
   *
   * loads the json for the master ticker list
   *
   * @return {Void}
   */
  loadUsersAgreed() {
    const botName = this._bot.name;
    const url = `json/coc.${botName}.json`;

    try {
      tickers = JSON.parse(fs.readFileSync(url, 'utf8'));
    } catch (e) {
      usersAgreed = {};
      this.saveUsersAgreed();
    }
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
        coc: {
          f: this.coc,
          desc: 'Shows the initial Code of Conduct message',
          syntax: [`${trigger}coc`],
        },
      },
    };
  }

  /**
   * ## saveUsersAgreed
   *
   * saves the json to the master ticker list
   *
   * @return {Void}
   */
  saveUsersAgreed() {
    const botName = this._bot.name;

    const usersAgreedJSON = JSON.stringify(usersAgreed);
    fs.writeFileSync(
      `./json/coc.${botName}.json`,
      usersAgreedJSON,
      'utf8'
    );
  }

  /**
   * ## tickCoC
   *
   * loads the list of tickers and starts them
   *
   * @param {String} channelId internal name for the channeö
   *
   * @return {Void}
   */
  tickCoC(channelId) {
    // get users

    this.loadUsersAgreed();

    users.forEach(user => {
      const attempts = usersAgreed[user];

      if (attempts !== true) {
        // check attepts amount. if over X attempts, message an admin
        // else, sends CoC message to unresponded users
        console.log(`${user} has not agreed`)
      }
      // this.buildTicker(t);
    });
  }

  /**
   * ## setUserAgreed
   *
   * accepts a user response
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
  setUserAgreed(from, to, text, textArr, command, confObj) {
    this.loadUsersAgreed();

    usersAgreed[confObj.to] = true;

    this.saveUsersAgreed();

    return 'Enjoy GalaxyPotato!';
  }
}

module.exports = CoC;
