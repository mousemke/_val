/**
 * Lists
 */
const travolta = require('../lists/travolta.js');
const nouns = require('../lists/nouns.js');
const cars = require('../lists/cars.js');
const textResponses = require('../lists/plainText.js');
const fish = require('../lists/fish.js');
const Module = require('./Module.js');

const moonRegex = /(?:m([o]+)n)/;
const spaceRegex = /(?:sp([a]+)ce)/;
const khanRegex = /(?:kh([a]+)n)/;
const fettiRegex = /.+fetti$/;
const endRegex = /.+end$/;

const { fishTypes, preparation } = fish;
const lastFishDay = {};

/**
 * this is entirely filled with nonsense.  thats all the docs this needs.
 */
class PlainText extends Module {
  /**
   * ## dance
   *
   * returns 2-3 dancers
   *
   * @return {String} dancers
   */
  dance() {
    const dancer = Math.floor(Math.random() * 80);

    if (dancer === 3) {
      return '└[∵┌]└[ ∵ ]┘[┐∵]┘';
    } else {
      return '♪┏(・o･)┛♪┗ ( ･o･) ┓♪';
    }
  }

  /**
   * ## disappearinacloudofsmoke
   *
   * you cant have this ability!
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   * @param {Object} confObj configuration object
   *
   * @return {String} scolding
   */
  disappearinacloudofsmoke(from, to, text, textArr, command, confObj) {
    setTimeout(() => {
      this._bot.say(
        from,
        'I mean...  why would you just assume you can have any new ability you want....',
        confObj
      );
    }, 7500);

    setTimeout(() => {
      this._bot.say(from, 'ಠ_ಠ', confObj);
    }, 1500);

    return "no...  you don't have that ability.";
  }

  /**
   * ## dodge
   *
   * by stefan's request
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   * @param {Object} confObj configuration object
   *
   * @return {Void} void
   */
  dodge(from, to, text, textArr) {
    if (textArr[0]) {
      to = textArr[0];
    }

    let botText = ` hits ${to} with a `;
    const car = cars[Math.floor(Math.random() * cars.length)];

    const carModel = car[0];
    const carYear = car[1];
    const carYearEnd = car[2];

    if (!carYear) {
      botText += `Dodge ${carModel}`;
    } else if (!carYearEnd) {
      botText += `${carYear} Dodge ${carModel}`;
    } else {
      const spread = carYearEnd - carYear;
      const year = Math.floor(Math.random() * spread) + carYear;
      botText += `${year} Dodge ${carModel}`;
    }

    return botText;
  }

  /**
   * ## end
   *
   * what can you do with the tools available?
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   * @param {Object} confObj configuration object
   *
   * @return {String} action action action
   */
  end(from, to, text, textArr, command) {
    const num = Math.floor(Math.random() * nouns.length);
    const noun = nouns[num];

    let botText = `${command}s ${noun[0]}`;

    if (textArr[0]) {
      const connections = [' to ', ' at '];

      const num2 = Math.floor(Math.random() * connections.length);
      botText += connections[num2] + textArr[0];
    }

    return botText;
  }

  /**
   * ## Fetti!
   *
   * confetti all the things
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   *
   * @return {String} a party.  in string form
   */
  fetti(from, to, text, textArr, command, confObj) {
    const type = command.slice(0, command.length - 5);
    let word = type;

    switch (type) {
      case 'emergency':
        word = ['🚑 ', '🚨 ', '🚒 ', '🚓 '];
        break;
      case 'doge':
        word = ['wow ', 'Ð ', 'doge ', 'moon ', 'ÐÐÐ ', 'such ', 'is '];
        break;
      case 'con':
        word = "´ . ' ";
        break;
      case 'spooky':
        word = ['\\༼☯༽/ ', '༼°°༽ ', 'SPOOKY ', 'GHOSTS '];
        break;
      case 'moon':
        word = ['moon ', 'moooooooon ', 'doge ', 'wow '];
        break;
      case 'troll':
        word = [
          'http://trololololololololololo.com/',
          'http',
          'trolo',
          'lolo',
          'ololo.com',
          'troll',
        ];
        break;
      case 'trøll':
        word = [
          'http://trølølølølølølølølølølø.cøm/',
          'http',
          'trølø',
          'lølø',
          'ølølø.cøm',
          'trøll',
        ];
        break;
      case 'xmas':
      case 'christmas':
        word = ['ʕ◔ᴥ◔ʔ ', '☃ ', 'presents ', '✦ ', 'santa ', '⁂ ', 'satan '];
        break;
      case 'fork':
        word = ['--E '];
        break;
      case 'fukt':
        word = ['ا҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢̅ͬͦͬͬͤ҈̢̅ͬͦͬͬͤ҉̢ ', '⌒͝͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡͡ '];
        break;
      case 'cone':
        word = ['/\\ '];
        break;
    }
    const userConfig = this.userConfig;
    if (type.length > userConfig.plainTextFettiWordLength) {
      word = ['toolong'];
    }
    if (typeof word === 'string') {
      word = [word];
    }
    for (
      let i = 0, lenI = userConfig.plainTextFettiOptions.length;
      i < lenI;
      i++
    ) {
      word.push(userConfig.plainTextFettiOptions[i] + ' ');
    }
    let botText = '';
    for (let i = 0; i < userConfig.plainTextFettiLength; i++) {
      const option = Math.floor(Math.random() * word.length);
      botText += word[option];
    }
    return botText;
  }
  /**
   * ## fish
   *
   * what's on the menu
   *
   * @return {String} today's special
   */ fish() {
    const date = this.getDate();
    let preparationNum;
    let fishNum;
    if (lastFishDay.date === date) {
      preparationNum = lastFishDay.preparationNum;
      fishNum = lastFishDay.fishNum;
    } else {
      preparationNum = Math.floor(Math.random() * preparation.length);
      fishNum = Math.floor(Math.random() * fishTypes.length);
      lastFishDay.date = date;
      lastFishDay.preparationNum = preparationNum;
      lastFishDay.fishNum = fishNum;
    }
    const p = preparation[preparationNum];
    const f = fishTypes[fishNum];
    return `Today's fish is, "${p} ${f}", enjoy your meal`;
  }
  /**
   * ## g
   *
   * searches google for things
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   *
   * @return {String} google search url
   */ g(from, to, text) {
    text = text.split(' ').join('%20');
    return `https://www.google.de/search?hl=en&q=${text}`;
  }
  /**
   * ## germanysGotTalent
   *
   * showcases germany's amazing talents
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   *
   * @return {String} youtube url
   */ germanysGotTalent(from, to, text) {
    const choices = [
      'https://www.youtube.com/watch?v=IeWAPVWXLtM',
      'https://www.youtube.com/watch?v=dNUUCHsgRu8',
      'https://www.youtube.com/watch?v=PJQVlVHsFF8',
      'https://www.youtube.com/watch?v=xRVvegLwK_o',
    ];
    const choice = Math.floor(Math.random() * choices.length);
    return choices[choice];
  }
  /**
   * ## gets the current date as a string
   *
   * @return {String} date string
   */ getDate() {
    return new Date().toJSON().split('T')[0];
  }
  /**
   * ## google
   *
   * searches google for things
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   *
   * @return {String} google search url
   */ google(from, to, text) {
    text = text.split(' ').join('%20');
    return `http://www.lmgtfy.com/?q=${text}`;
  }
  /**
   * ## khan
   *
   * because.  i mean seriously, everything in this particular file is
   * fairly useless
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   *
   * @return {String} Botany Bay?
   */ khan(from, to, text, textArr, command) {
    const khan = khanRegex.exec(command);
    let botText = 'kh';
    khan.forEach(() => {
      botText += 'aa';
    });
    return `${botText.toUpperCase()}N!!!!!!`;
  }
  /**
   * ## moon
   *
   * because.  i mean seriously, everything in this particular file is
   * fairly useless
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   *
   * @return {String} to the moon!
   */ moon(from, to, text, textArr, command) {
    if (command !== 'moonflakes') {
      const moon = moonRegex.exec(command);
      let botText = 'm';
      moon.forEach(() => {
        botText += 'ooo';
      });
      if (moon.length < 4) {
        return `To the ${botText}n!`;
      }
      if (moonLength > 6) {
        return `${botText.toUpperCase()}N!!!!!!!!`;
      }
    }
  }
  /**
   * ## responses
   *
   * @return {Object} responses
   */ responses() {
    const { trigger } = this.userConfig;
    const responses = {
      regex: {
        [`${endRegex}`]: {
          f: this.end,
          desc: 'defend yourself',
          syntax: [
            `${trigger}defend`,
            `${trigger}lowend <user>`,
            `${trigger}upend`,
          ],
        },
        [`${fettiRegex}`]: {
          f: this.fetti,
          desc: 'confetti all the things o/',
          syntax: [
            `${trigger}confetti`,
            `${trigger}moonfetti`,
            `${trigger}fettofetti`,
          ],
        },
        [`${khanRegex}`]: {
          f: this.khan,
          desc: 'Botany Bay?',
          syntax: [
            `${trigger}khan`,
            `${trigger}khaaaaan`,
            `${trigger}khaaaaaaaaaaan`,
          ],
        },
        [`${moonRegex}`]: {
          f: this.moon,
          desc: '',
          syntax: [
            `${trigger}moon`,
            `${trigger}moooooon`,
            `${trigger}moooooooooon`,
          ],
        },
        [`${spaceRegex}`]: {
          f: this.space,
          desc: '',
          syntax: [
            `${trigger}space`,
            `${trigger}spaaace`,
            `${trigger}spaaaaaaaace`,
          ],
        },
      },
      commands: {
        dance: {
          f: this.dance,
          desc: 'dance dance!',
          syntax: [`${trigger}dance`],
        },
        disappearinacloudofsmoke: {
          f: this.disappearinacloudofsmoke,
          desc: "that's not at thing...",
          syntax: [`${trigger}disappearinacloudofsmoke`],
        },
        dodge: {
          f: this.dodge,
          desc: 'look out!',
          syntax: [`${trigger}dodge`, `${trigger}dodge <user>`],
        },
        fish: {
          f: this.fish,
          desc: 'todays special',
          syntax: [`${trigger}fish`],
        },
        g: {
          f: this.g,
          desc: 'search google',
          syntax: [`${trigger}g <query>`],
        },
        germanysgottalent: {
          f: this.germanysGotTalent,
          desc: "see germany's finest",
          syntax: [`${trigger}germanysgottalent`],
        },
        google: {
          f: this.google,
          desc: 'search google',
          syntax: [`${trigger}g <query>`],
        },
        ping: {
          f: (from, to) => `${to}: pong!`,
          desc: 'test a response',
          syntax: [`${trigger}ping`],
        },
        travolta: {
          f: this.travolta,
          desc: 'because',
          syntax: [`${trigger}travolta`],
        },
        trophy: {
          f: this.trophy,
          desc: 'give that person a trophy',
          syntax: [`${trigger}trophy`],
        },
        w: {
          f: this.wiki,
          desc: 'search wikipedia',
          syntax: [`${trigger}w <query>`],
        },
        wave: {
          f: this.wave,
          desc: 'say hi',
          syntax: [`${trigger}wave`],
        },
        wiki: {
          f: this.wiki,
          desc: 'search wikipedia',
          syntax: [`${trigger}wiki <query>`],
        },
        wow: {
          f: () => 'http://pics.knoblau.ch/wow.gif',
          desc: 'Bravo!',
          syntax: [`${trigger}wow`],
        },
      },
    };
    Object.keys(textResponses).forEach(res => {
      responses.commands[res] = {
        f: function() {
          return textResponses[res];
        },
        desc: `plain text response: ${res}`,
        syntax: [`${trigger}${res}`],
      };
    });
    return responses;
  }
  /**
   * ## travolta
   *
   * because
   *
   * @return {void}
   */ travolta() {
    return travolta[Math.floor(Math.random() * travolta.length)];
  }
  /**
   * ## trophy
   *
   * gives someone a trophy
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   *
   * @return {String} trophy url
   */ trophy(from, to, text, textArr) {
    const user = textArr[0]
      ? `${this.userConfig.usernamePrefix[0]}${textArr[0]}`
      : '';
    return `${user} http://pics.knoblau.ch/trophy.png`;
  }
  /**
   * ## space
   *
   * because.  i mean seriously, everything in this particular file is
   * fairly useless
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   * @param {Array} textArr text broken into an array of words
   * @param {String} command text that triggered the bot
   *
   * @return {String} to the moon!
   */ space(from, to, text, textArr, command) {
    const space = spaceRegex.exec(command);
    let botText = 'sp';
    space.forEach(() => {
      botText += 'aa';
    });
    return `${botText.toUpperCase()}CE!!!!!!`;
  }
  /**
   * ## wave
   *
   * waves at people or the sender
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   */ wave(from, to, text) {
    const target = text || to;
    return `${target} o/`;
  }
  /**
   * ## wiki
   *
   * searches wikipedia for things
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text message text
   *
   * @return {String} wikipedia search url
   */ wiki(from, to, text) {
    text = text.split(' ').join('%20');
    return `http://en.wikipedia.org/wiki/${text}`;
  }
}
module.exports = PlainText;
