const Module = require('./Module.js');
const fs = require('fs');

const rollRegex = /^(\d+)?(?:[dD]([0-9][\d]+|[1-9]))(?:[+](\d+))?$/;
const DW_CHANNEL = 'CB391DZQT';

let characters = {};

class DND extends Module {
  /**
   * ## actAs
   *
   * performs an action to the dark heracy channel in the voice of your character
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
  actAs(from, to, text, textArr, command, confObj) {
    this.loadCharacterList();

    characters[DW_CHANNEL] = characters[DW_CHANNEL] || {};

    const characterName = characters[DW_CHANNEL][to];

    if (characterName) {
      this._bot.say(DW_CHANNEL, `_${characterName} ${text}_`);

      return 'done';
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

    this.loadCharacterList();
  }

  /**
   * ## listCharacters
   *
   * reports the active characters in the current channel
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
  listCharacters(from, to, text, textArr, command, confObj) {
    const channelId = confObj.from;

    characters[channelId] = characters[channelId] || {};

    if (Object.keys(characters[channelId]).length === 0) {
      return 'Sorry, there are no characters in this channel.';
    }

    let botText = 'Characters currently in this channel:\n';

    Object.keys(characters[channelId]).forEach(player => {
      botText += `*${characters[channelId][player]}* : _${player}_\n`;
    });

    return botText;
  }

  /**
   * ## loadCharacterList
   *
   * loads the json for the master ticker list
   *
   * @return {Void}
   */
  loadCharacterList() {
    const botName = this._bot.name;
    const url = `json/characters/characters.${botName}.json`;

    try {
      characters = JSON.parse(fs.readFileSync(url, 'utf8'));
    } catch (e) {
      characters = {};
      this.saveCharacterList();
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
        actAs: {
          f: this.actAs,
          desc: 'acts in the voice of your dark herasy character',
          syntax: [`${trigger}actAs <words>`],
        },

        listCharacters: {
          f: this.listCharacters,
          desc:
            'lists all characters in the channel and their corresponding player',
          syntax: [`${trigger}listCharacters`],
        },

        sayAs: {
          f: this.sayAs,
          desc: 'speaks in the voice of your dark herasy character',
          syntax: [`${trigger}sayAs <words>`],
        },

        setCharacter: {
          f: this.setCharacter,
          desc: 'sets your character in the channel',
          syntax: [`${trigger}setCharacter <name>`],
        },
      },

      regex: {
        [`${rollRegex}`]: {
          f: this.roll,
          desc: 'roll them bones',
          syntax: [`${trigger}d10`, `${trigger}16d6`, `${trigger}9d12+6`],
        },
      },
    };
  }

  /**
   * ## roll
   *
   * rolls X dice with the Y sides
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   * @param {Object} confObj configuration object
   *
   * @return {Void}
   */
  roll(from, to, text, textArr, command, confObj) {
    const userConfig = this.userConfig;

    const dndRooms = userConfig.dndRooms;
    const maxDice = userConfig.dndMaxDice;

    let botText = '';

    function exectuteRoll(roll) {
      function _getDie(_max) {
        return Math.floor(Math.random() * _max) + 1;
      }

      let rolls = parseInt(roll[1]);
      const max = parseInt(roll[2]);
      const bonus = parseInt(roll[3] || 0);

      if (rolls > maxDice) {
        botText = `Come on ${to}...   do you *really* need that many dice?`;

        return false;
      } else if (rolls === 0) {
        botText = `Really? Fine ${to}...   your 0d${max} rolls...  0`;

        return false;
      }

      rolls = rolls || 1;
      const multiple = rolls > 1;
      let total = 0;

      botText = `${to}, your ${rolls}d${max}${
        bonus ? '+' + bonus : ''
      } rolls: `;

      for (let i = 0; i < rolls; i++) {
        if (multiple && i === rolls - 1) {
          botText += ' &';
        }

        const result = _getDie(max) + bonus;
        total += result;
        botText += ` ${result}, `;
      }

      botText = botText.slice(0, botText.length - 2);

      if (multiple) {
        botText += ` (total: ${total})`;
      }
    }

    if (
      dndRooms.indexOf(from) !== -1 ||
      dndRooms === '*' ||
      dndRooms[0] === '*'
    ) {
      const roll = rollRegex.exec(command);

      if (roll && roll[2]) {
        exectuteRoll(roll);
      }
    }

    return botText;
  }

  /**
   * ## saveCharacterList
   *
   * saves the json to the master ticker list
   *
   * @return {Void}
   */
  saveCharacterList() {
    const botName = this._bot.name;

    const charactersJSON = JSON.stringify(characters);
    fs.writeFileSync(
      `./json/characters/characters.${botName}.json`,
      charactersJSON,
      'utf8'
    );
  }

  /**
   * ## sayAs
   *
   * says somethig to the dark heracy channel in the voice of your character
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
  sayAs(from, to, text, textArr, command, confObj) {
    this.loadCharacterList();

    characters[DW_CHANNEL] = characters[DW_CHANNEL] || {};

    const characterName = characters[DW_CHANNEL][to];

    if (characterName) {
      this._bot.say(DW_CHANNEL, `*${characterName}* : ${text}`);

      return 'done';
    }
  }

  /**
   * ## setCharacter
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
  setCharacter(from, to, text, textArr, command, confObj) {
    const name = textArr[0];

    if (!name) {
      return 'invalid Name';
    }

    this.loadCharacterList();

    const channelId = confObj.from;

    characters[channelId] = characters[channelId] || {};

    if (name) {
      characters[channelId][to] = name;
      this.saveCharacterList();

      return `You have set your character in this channel to ${name}`;
    }

    return botText;
  }
}

module.exports = DND;
