const Module = require('./Module.js');
const fs = require('fs');

let alias = {};

/**
 * this modules contains admin only functions.  they are generally called with
 * a double trigger ( '++', '!!', etc)
 */
class Admin extends Module {
  /**
   * ## checkChannel
   *
   * return the actual current channel id
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   * @param {Object} confObj configuration object
   *
   * @return {String} channel id
   */
  checkChannel(from, to, text, textArr, command, confObj) {
    if (this.isAdmin(to)) {
      return `${confObj.from}`;
    }
  }

  /**
   * ## checkUser
   *
   * returns a user's id
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   * @param {Object} confObj configuration object
   *
   * @return {String} user id
   */
  checkUser(from, to, text, textArr, command, confObj) {
    if (this.isAdmin(to)) {
      if (textArr.length === 0) {
        return confObj.to;
      }

      const userToCheck = textArr[0];

      return confObj.getUserId ? confObj.getUserId(userToCheck) : userToCheck;
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

    this.loadAliasList();
  }

  /**
   * ## isAdmin
   *
   * checks if someone is an admin or not
   *
   * @param {String} to originating user
   *
   * @return {Boolean} admin or not
   */
  isAdmin(to) {
    const { userConfig } = this;

    if (userConfig.admins.indexOf(to.toLowerCase()) !== -1) {
      return true;
    }

    return false;
  }

  /**
   * ## loadAliasList
   *
   * loads the json for the alias' list
   *
   * @return {Void}
   */
  loadAliasList() {
    const botName = this._bot.name;
    const url = `json/alias/alias.${botName}.json`;

    try {
      alias = JSON.parse(fs.readFileSync(url, 'utf8'));
    } catch (e) {
      alias = {};
      this.saveAliasList();
    }
  }

  /**
   * ## removeAlias
   *
   * removes a specific alias to the roon
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full message text
   * @param {String} textArr full message text split by " "
   *
   * @return {String} success message
   */
  removeAlias(from, to, text, textArr) {
    if (this.isAdmin(to)) {
      const aliasToRemove = textArr[0];

      if (!alias[from]) {
        return 'There are no aliases in this room';
      } else if (!alias[from][aliasToRemove]) {
        return `There is no alias !${aliasToRemove} in this room`;
      }

      delete alias[from][aliasToRemove];

      this.saveAliasList();

      return `Alias !${aliasToRemove} removed from #${from}`;
    }
  }

  /**
   * ## responses
   *
   * admin responses.  they are generally called with
   * a double trigger ( '++', '!!', etc)
   *
   * @return {Object} responses
   */
  responses() {
    const { userConfig } = this;
    const { trigger } = userConfig;

    const res = {
      commands: {
        [`${trigger}channel`]: {
          f: this.checkChannel,
          desc:
            "returns the current channel's unique identifier (admin command)",
          syntax: [`${trigger}${trigger}channel`],
        },

        [`${trigger}removeAlias`]: {
          f: this.removeAlias,
          desc: 'removes an alias from the room (admin command)',
          syntax: [`${trigger}${trigger}removeAlias [alias]`],
        },

        [`${trigger}setAlias`]: {
          f: this.setAlias,
          desc: 'adds an alias to the room (admin command)',
          syntax: [
            `${trigger}${trigger}setAlias [alias] [user1, user2, etc.. ]`,
          ],
        },

        [`useAlias`]: {
          f: this.useAlias,
          desc: 'triggers an alias. mostly used by the language parsers',
          syntax: [`${trigger}useAlias`],
        },

        [`${trigger}userId`]: {
          f: this.checkUser,
          desc: "returns a user's unique identifier (admin command)",
          syntax: [`${trigger}${trigger}userId [user]`],
        },

        [`${trigger}v`]: {
          f: this.version,
          desc: 'returns the current running version number (admin command)',
          syntax: [`${trigger}${trigger}v`],
        },
      },
    };

    return res;
  }

  /**
   * ## saveAliasList
   *
   * saves the json to the alias' list
   *
   * @return {Void}
   */
  saveAliasList() {
    const botName = this._bot.name;
    const url = `json/alias/alias.${botName}.json`;

    const aliasJSON = JSON.stringify(alias);
    fs.writeFileSync(`./${url}`, aliasJSON, 'utf8');
  }

  /**
   * ## setAlias
   *
   * adds a specific alias to the roon
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   * @param {Object} confObj configuration object
   *
   * @return {String} channel id
   */
  setAlias(from, to, text, textArr, command, confObj) {
    if (this.isAdmin(to)) {
      const aliasToAdd = textArr[0];
      alias[from] = alias[from] || {};

      const overwrite = Boolean(alias[from][aliasToAdd]);

      let usersArr;

      if (confObj && confObj.originalText) {
        usersArr = confObj.originalText.split(' ').slice(2);
      } else {
        usersArr = textArr
          .slice(1)
          .filter(t => Boolean(t.trim()))
          .map(t => `@${t}`);
      }

      alias[from][aliasToAdd] = usersArr;
      this.saveAliasList();

      if (overwrite) {
        return `Alias !${aliasToAdd} in #${from} overwritten`;
      }

      return `Alias !${aliasToAdd} added to #${from}`;
    }
  }

  /**
   * ## useAlias
   *
   * triggers an alias
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full message text
   * @param {String} textArr full message text split by " "
   *
   * @return {String} success message
   */
  useAlias(from, to, text, textArr) {
    const aliasToUse = textArr
      .map(a => {
        if (alias[from] && alias[from][a]) {
          return alias[from][a].join(' ');
        }

        return null;
      })
      .filter(Boolean);

    if (Array.isArray(aliasToUse) && aliasToUse.length !== 0) {
      return `${text} ( ${aliasToUse.join(' ')} )`;
    }
  }

  /**
   * ## version
   *
   * returns the version number of val currently running
   *
   * @param {String} from channel message originated from
   * @param {String} to person who sent the message
   *
   * @return {String} version text
   */
  version(from, to) {
    const { userConfig } = this;

    if (this.isAdmin(to)) {
      return `Well, ${to}, thanks for asking!  I'm currently running version ${userConfig.version}`;
    }
  }
}

module.exports = Admin;
