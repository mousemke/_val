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
    const { admins, cocAdminChannel } = this.userConfig;

    if (!textArr || textArr.length === 0) {
      const {
        cocMessage,
        trigger,
      } = this.userConfig;

      if (cocMessage) {
        const adminsString = `@${admins.join(', @')}`;

        let botText = `${cocMessage}`;
        botText += `\nOnce you have read through the CoC, please agree by replying to this message with:\n${trigger}coc agree`;
        botText += `\n\nIf you have any questions about the CoC, or why it is important, feel free to reach out to an admin (${adminsString})`;

        return botText;
      }

      return '';
    }

    const response = textArr[0].toLowerCase();

    if (response === 'agree') {
      return this.setUserAgreed(confObj);
    }

    let fixedUser = to;
    if (this.commandModule.nameFormat) {
      fixedUser = this.commandModule.nameFormat(to);
    }

    this._bot.say(cocAdminChannel, `${fixedUser} - bad CoC response - ${response}`);
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
      cocReminders,
      cocMessage,
    } = userConfig;

    if (cocMessage) {
      this.loadUsersAgreed();

      if (cocReminders) {
        this.tickCoC = this.tickCoC.bind(this);

        this.cocInterval = setInterval(
          this.tickCoC,
          cocReminderFrequency * 1000 * 60 * 60 * 24,
        );
      }
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
      usersAgreed = JSON.parse(fs.readFileSync(url, 'utf8'));
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
   * ## setUserAgreed
   *
   * accepts a user response
   *
   * @return {String} success message
   */
  setUserAgreed(confObj) {
    this.loadUsersAgreed();

    usersAgreed[confObj.to] = true;

    this.saveUsersAgreed();

    return 'Enjoy GalaxyPotato!';
  }

  /**
   * ## tickCoC
   *
   * loads the list of tickers and starts them
   *
   * @return {Void}
   */
  tickCoC() {
    const {
      cocAdminChannel,
      cocMaxRetries,
    } = this.userConfig;

    this.loadUsersAgreed();

    Object.keys(usersAgreed).forEach(user => {
      let attempts = usersAgreed[user];

      if (attempts !== true) {
        let fixedUser = user;

        if (this.commandModule.nameFormat) {
          fixedUser = this.commandModule.nameFormat(fixedUser);
        }

        if (typeof attempts === 'number' && attempts > cocMaxRetries) {
          this._bot.say(cocAdminChannel, `${fixedUser} has not agreed to the CoC (max attempts reached)`);
        } else {
          const fullMessage = this.coc();
          this._bot.pm(user, fullMessage);

          if (typeof attempts !== 'number') {
            attempts = 0;
          }

          usersAgreed[user] = attempts + 1;

          this.saveUsersAgreed();
        }
      }
    });
  }

}

module.exports = CoC;
