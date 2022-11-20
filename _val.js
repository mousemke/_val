const modulesConfig = require('./config/_val.modules.js');
const http = require('http');
const https = require('https');
const fs = require('fs');
const chalk = require('chalk');
const request = require('request');

const valConfig = require('./config/_val.config.js');
const packageJSON = require('./package.json');

/**
 * colors use by chalk for console messages
 */
const debugChalkBox = {
  PING: 'blue',
  MODE: 'magenta',
  rpl_channelmodeis: 'cyan',
  rpl_myinfo: 'cyan',
  rpl_creationtime: 'cyan',
  rpl_namreply: 'cyan',
  rpl_endofnames: 'cyan',
  rpl_topic: 'gray',
  rpl_isupport: 'magenta',
  rpl_welcome: 'magenta',
  rpl_luserclient: 'magenta',
  rpl_motdstart: 'bgMagenta',
  rpl_motd: 'bgMagenta',
  rpl_endofmotd: 'bgMagenta',
  JOIN: 'green',
  KILL: 'green',
  NOTICE: 'yellow',
  TOPIC: 'yellow',
};

/**
 *
 * @param {*} commandModuleName
 * @param {*} userConfig
 * @returns
 */
const _Val = function(commandModuleName, userConfig) {
  const commandModule = userConfig.command[commandModuleName];
  const coreConfig = commandModule.coreConfig || {};
  const _botConfig = Object.assign({}, userConfig, coreConfig);

  const { trigger } = _botConfig;
  const commandType = commandModule.botName;
  const req = userConfig.req;
  const http = req.http;
  const https = req.https;
  const chalk = req.chalk;

  let _bot = {};
  let channels = [];
  const modules = {};

  /**
   * ## addLanguageParsers
   *
   * resolves the language parsers from the config and adds them to _bot
   *
   * @return {Void}
   */
  function addLanguageParsers(_botConfig) {
    _bot.languageParsers = [];

    const languageParsers = userConfig.language;

    for (const parserName in languageParsers) {
      const parser = languageParsers[parserName];

      if (parser.enabled && !_botConfig.disabledLanguageModules.includes(parserName)) {
        _bot.languageParsers.push(require(parser.url));

        if (parser.options) {
          for (let option in parser.options) {
            _botConfig[option] = parser.options[option];
          }
        }
      }
    }
  }

  /**
   * ## apiGet
   *
   * gets and parses JSON from api sources
   *
   * @param {String} url target url
   * @param {Function} cb callback
   * @param {Boolean} secure https?
   * @param {String} from channel
   * @param {String} to user
   *
   * @return {Void}
   */
  function apiGet(options, cb, secure, from, to) {
    secure = Boolean(secure);

    const error = e => {
      if (_bot.say && from && to) {
        _bot.say(
          from,
          `sorry, ${to} bad query or url. (depends on what you were trying to do)`
        );
      } else {
        console.warn(
          `${options.url || options.host || options} appears to be down`,
          e
        );
      }
    };

    const callback = res => {
      let body = '';

      res.on('data', chunk => {
        body += chunk;
      });

      res.on('end', () => {
        let data;

        try {
          try {
            data = JSON.parse(body);
          } catch (e) {
            data = body;
          }

          cb(data);
        } catch (e) {
          error(e);
        }
      });
    };

    try {
      if (options.method === 'POST') {
        if (secure) {
          https.request(options, callback).on('error', function(e) {
            error(e);
          });
        } else {
          http.request(options, callback).on('error', function(e) {
            error(e);
          });
        }
      } else {
        if (secure) {
          https.get(options, callback).on('error', function(e) {
            error(e);
          });
        } else {
          http.get(options, callback).on('error', function(e) {
            error(e);
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * ## baseResponses
   *
   * val's base responses that both require no modules and are non-optional
   * @type {Object}
   */
  const baseResponses = {
    commands: {
      active: {
        module: 'base',
        f: checkActive,
        desc: 'checks how many people are active in the channel',
        syntax: [`${trigger}active`],
      },

      help: {
        module: 'base',
        f: helpText,
        desc: 'returns help text',
        syntax: [`${trigger}help`, `${trigger}help <command>`],
      },

      isup: {
        module: 'base',
        f: () => "Yes, but c'mon!  At least use a full sentence!",
        desc: "returns _val's current status",
        syntax: [`${trigger}isup`],
      },

      'moon?': {
        module: 'base',
        f: () =>
          'In 500 million years, the moon will be 14,600 miles farther away than it is right now. When it is that far, total eclipses will not take place',
        desc: 'learn more about the moon',
        syntax: [`${trigger}moon`],
      },
    },

    dynamic: {},

    regex: {},
  };

  /**
   * ## buildClient
   *
   * assembles the _val modules.  like Voltron but node
   *
   * @return {Void}
   */
  function buildClient() {
    /*
     * adds core components to an obj to be passed modules
     */
    modules.core = {
      checkActive: checkActive,

      userData: userData,

      apiGet: apiGet,
    };

    modules.constructors = {};

    /**
     * load _val modules
     */
    for (const moduleName in modulesConfig) {
      const module = modulesConfig[moduleName];

      if (module.enabled) {
        modules.constructors[moduleName] = require(module.url);

        if (module.options) {
          for (let option in module.options) {
            _botConfig[option] = module.options[option];
          }
        }
      }
    }
  }

  /**
   * ## buildCore
   *
   * dynamic core loader
   *
   * @return {Void}
   */
  function buildCore() {
    const Commander = require(commandModule.url);

    _bot = new Commander(
      _botConfig,
      channels,
      listenToMessages,
      displayDebugInfo,
      this,
      commandModule
    );

    _bot.name = commandModule.botName;

    addLanguageParsers(_botConfig);
  }

  /**
   * ## checkActive
   *
   * returns a list of users that have posted within the defined amount of time
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full message text
   * @param {Boolean} talk true to say, otherwise active only returns
   *
   * @return {Array} active users
   */
  function checkActive(from, to, text, talk) {
    let name;
    let i = 0;
    let now = Date.now();

    const activeUsers = [];

    if (!_bot.active[from]) {
      _bot.active[from] = {};
    }

    const activeChannel = _bot.active[from];

    if (
      !activeChannel[to] &&
      to !== _bot.name &&
      _botConfig.bots.indexOf(to) === -1
    ) {
      activeChannel[to] = now;
      now++;
    }

    for (name in activeChannel) {
      if (now - _botConfig.activeTime < activeChannel[name]) {
        i++;
        activeUsers.push(name);
      } else {
        delete activeChannel[name];
      }
    }

    if (talk !== false) {
      botText = `I see ${i} active user`;

      if (i > 1 || i === 0) {
        botText += 's';
      }

      botText += ` in ${from}`;

      return botText;
    }

    return activeUsers;
  }

  /**
   * ## combineResponses
   *
   * combines two response structures while checking for duplicate keys
   *
   * @param {Object} res responses
   * @param {Object} newRes responses to add
   *
   * @return {Object} combined object
   */
  function combineResponses(res, newRes, regex) {
    if (newRes) {
      Object.keys(newRes).forEach(c => {
        let command = c;

        if (regex) {
          command = c.slice(0, c.length - 1).slice(1);
        }

        if (res[c]) {
          console.warn(`duplicate property ${c}`);
        } else {
          res[command] = newRes[c];
        }
      });
    }

    return res;
  }

  /**
   * ## displayDebugInfo
   *
   * formats and displays debug information
   *
   * @return {Void}
   */
  function displayDebugInfo(e) {
    const command = e.command;

    if (command !== 'PRIVMSG') {
      const color = debugChalkBox[command];
      let text = `     * ${command} : `;

      e.args.forEach(arg => (text += `${arg} `));

      if (color) {
        if (command === 'PING') {
          const now = Date.now();
          let minUp = `${Math.round(((now - up) / 1000 / 60) * 100) / 100}`;

          if (minUp.indexOf('.') === -1) {
            minUp += '.00';
          } else if (minUp.split('.')[1].length !== 2) {
            minUp += '0';
          }

          console.log(
            chalk[color](text),
            `${now - lastPing}ms`,
            chalk.grey(`(${minUp}min up)`, new Date().toLocaleString())
          );
          lastPing = now;

          if (connectionTimer) {
            clearTimeout(connectionTimer);
          }

          connectionTimer = setTimeout(
            reConnection,
            _botConfig.reconnectionTimeout
          );
        } else {
          console.log(chalk[color](text));
        }
      } else {
        console.log(e);
      }
    }
  }

  /**
   * ## generateChannelList
   *
   * generates a channel list based on settings and environment.
   *
   * @return {Void}
   */
  function generateChannelList() {
    /**
     * adds private channels from _botConfig.channelsPrivateJoin to the list of
     * channels to join.
     */
    function addPrivateChannels() {
      const privateChannels = commandModule.channelsPrivateJoin;

      if (privateChannels) {
        const privateChannelsLength = privateChannels.length;

        for (let i = 0; i < privateChannelsLength; i++) {
          const channel = privateChannels[i];

          if (channels.indexOf(channel) === -1) {
            channels.push(channel);
          }
        }
      }
    }

    /**
     * assembles the channel list and starts the client
     *
     * @return {Void}
     */
    function finishChannels() {
      _botConfig.publicChannels = [].concat(channels);

      if (commandModule.slackTeam) {
        addPrivateChannels();
      }

      removeBlacklistChannels();
      _botConfig.channels = channels;

      ini();
    }

    /**
     * if any channels are blacklisted from entering from _botConfig.channelsPublicIgnore,
     * this removes them from the channels array
     */
    function removeBlacklistChannels() {
      const blockedChannels = _botConfig.channelsPublicIgnore || [];
      const blockedChannelsLength = blockedChannels.length;

      if (blockedChannelsLength) {
        for (let i = 0; i < blockedChannelsLength; i++) {
          const b = blockedChannels[i];

          const index = channels.indexOf(b);

          if (index !== -1) {
            channels.splice(index, 1);
          }
        }
      }
    }

    if (commandModule.slackTeam && commandModule.autojoin) {
      const url = `https://${commandModule.slackTeam}.slack.com/api/channels.list?token=${userConfig.slackAPIKey}`;

      apiGet(
        url,
        function(res) {
          const channels = res.channels;

          for (let channel in channels) {
            channel = channels[channel].name;
            channel = channel[0] !== '#' ? `#${channel}` : channel;

            channels.push(channel);
          }

          finishChannels();
        },
        true
      );
    } else if (_botConfig.channels) {
      channels = _botConfig.channels;
      finishChannels();
    } else {
      console.log('no channels found');
    }
  }

  /**
   * ## helpText
   *
   * displays help text to the channel
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} query search parameter
   *
   * @return {String} help text
   */
  function helpText(from, to, text) {
    const responses = Object.assign(
      _bot.responses.commands || {},
      _bot.responses.regex,
      _bot.responses.dynamic
    );
    const responseText = responses[text];

    if (text.length === 0 || !responseText) {
      let str = 'available commands: ';

      Object.keys(responses).forEach(key => {
        str += ` ${key}, `;
      });

      return str.slice(0, str.length - 2);
    } else {
      let helpText = responseText.desc;
      const syntax = responseText.syntax;

      if (syntax) {
        try {
          syntax.forEach(s => (helpText += `\n${s}`));
        } catch (e) {
          throw `broken help : is ${text} syntax an array?`;
        }
      }

      return helpText;
    }
  }

  /**
   * ## ini
   *
   * sets listeners and module list up
   *
   * @return {Void}
   */
  function ini() {
    buildCore();

    _bot.active = {};
    _bot.responses = baseResponses;

    for (const moduleName in modules.constructors) {
      if (_botConfig.disabledModules.indexOf(moduleName) === -1) {
        const ModulesConstructor = modules.constructors[moduleName];
        const module = (modules[moduleName] = new ModulesConstructor(
          _bot,
          modules,
          _botConfig,
          commandModule
        ));

        function formatResponses(module, name) {
          module.responses = module.responses();

          ['commands', 'regex'].forEach(category => {
            const commands = module.responses[category];

            if (commands) {
              Object.keys(commands).forEach(r => {
                const res = commands[r];
                res.f = res.f.bind(module);
                res.moduleName = name;
                res.module = module;
              });
            }
          });
        }

        formatResponses(module, moduleName);

        _bot.responses.regex = combineResponses(
          _bot.responses.regex || {},
          module.responses.regex,
          'regex'
        );
        _bot.responses.commands = combineResponses(
          _bot.responses.commands || {},
          module.responses.commands
        );
      }
    }

    _bot.modules = modules;

    console.log(`${commandType} built`);
  }

  /**
   * ## listenToMessages
   *
   * .... what do you think?
   *
   * @param {String} to user
   * @param {String} from originating channel
   * @param {String} text full message text
   * @param {Object} confObj pass through variables from the core
   */
  function listenToMessages(to, from, text, confObj) {
    if (text) {
      if (_botConfig.verbose === true) {
        console.log(commandType, chalk.green(from), chalk.red(to), text);
      }

      text = trimUsernames(text);

      watchActive(from, to);

      if (_botConfig.bots.indexOf(to) === -1) {
        const trigger = _botConfig.trigger;
        const triggerLength = trigger.length;

        let botText = '';

        _bot.languageParsers.forEach(func => {
          if (text && botText === '') {
            let res = func(to, from, text, botText, _botConfig, confObj, _bot);

            to = res.to;
            text = res.text;
            botText = res.botText;
          }
        });

        if (
          text &&
          text.slice(0, triggerLength) === trigger &&
          text !== trigger &&
          botText === ''
        ) {
          text = text.slice(triggerLength);

          let textArr = text.split(' ');
          const command = textArr[0];
          textArr = textArr.slice(1);
          text = textArr.join(' ');

          if (_bot.responses.commands[command]) {
            return _bot.responses.commands[command].f(
              from,
              to,
              text,
              textArr,
              command,
              confObj
            );
          } else if (_bot.responses.dynamic[command]) {
            return _bot.responses.dynamic[command].f(
              from,
              to,
              text,
              textArr,
              command,
              confObj
            );
          } else {
            const regexKeys = Object.keys(_bot.responses.regex);

            regexKeys.every(r => {
              const regex = new RegExp(r);
              const match = command.match(regex);

              if (match && match.length > 0) {
                botText = _bot.responses.regex[r].f(
                  from,
                  to,
                  text,
                  textArr,
                  command,
                  confObj
                );

                return false;
              }

              return true;
            });
          }
        }

        return botText;
      } else if (
        _botConfig.bots.indexOf(to) !== -1 &&
        text[0] === _botConfig.trigger &&
        text !== _botConfig.trigger
      ) {
        // automated response to automated people
      }
    }
  }

  /**
   * ## reConnection
   *
   * disconnects and reconnects _val
   *
   * @return {Void}
   */
  function reConnection() {
    _bot.disconnect('Fine...  I was on my way out anyways.', function(e) {
      console.log('disconnected? ', e);
    });

    ini();
    console.log('re-initializing client...');
  }

  /**
   * ## start
   *
   * start the thing!
   *
   * @return {Void}
   */
  function start() {
    buildClient();
    generateChannelList();
  }

  /**
   * ## trimUsernames
   *
   * removes the set usernamePrefix from the front of usernames
   *
   * @param {String} text original text
   *
   * @return {String}
   */
  function trimUsernames(text) {
    if (_botConfig.usernamePrefix && _botConfig.usernamePrefix.length > 0) {
      text = text.split(' ');

      for (let i = 0, lenI = text.length; i < lenI; i++) {
        if (_botConfig.usernamePrefix.indexOf(text[i][0]) !== -1) {
          text[i] = text[i].slice(1);
        }
      }

      return text.join(' ');
    }

    return text;
  }

  /**
   * ## userData
   *
   * gets userdata from the nickserv authentication bot
   *
   * @param {String} to user
   * @param {String} from originating channel
   * @param {Function} cb callback
   * @param {String} origText original message text
   *
   * @return {Void}
   */
  function userData(to, from, cb, origText) {
    if (_botConfig.autoAuth) {
      const textSplit = origText.split(' ');

      cb(to, 'true', textSplit, origText);
    } else {
      const response = function(_from, text) {
        _bot.removeListener('pm', response);

        const textSplit = text.split(' ');
        const apiReturn = textSplit[0];
        const returnMessage = textSplit[1];
        const user = textSplit[2];
        const result = textSplit[3];

        if (
          apiReturn === _botConfig.nickservAPI &&
          returnMessage === 'identified' &&
          user === to &&
          result === 'true'
        ) {
          cb(to, result, textSplit, origText);
        } else if (
          apiReturn === _botConfig.nickservAPI &&
          returnMessage === 'identified' &&
          user === to &&
          result === 'false'
        ) {
          _bot.say(to, 'You are not identified. (/msg NickServ help)');
        } else if (
          apiReturn === _botConfig.NickservAPI &&
          returnMessage === 'notRegistered' &&
          user === to
        ) {
          _bot.say(to, 'You are not a registered user. (/msg NickServ help)');
        }
      };

      _bot.addListener('pm', response);

      _bot.say(
        _botConfig.nickservBot,
        `${_botConfig.nickservAPI} identify ${to}`
      );
    }
  }

  /**
   * ## watchActive
   *
   * sets the latest active time for a user in a channel
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   *
   * @return {Void}
   */
  function watchActive(from, to) {
    const ignoreTheBots = _botConfig.bots || [];

    if (ignoreTheBots.indexOf(to) === -1) {
      if (!_bot.active[from]) {
        _bot.active[from] = {};
      }
      _bot.active[from][to] = Date.now();
    }
  }

  start();

  this._bot = _bot;

  return this;
};

/** build a new _val instance */
function _val(commander, commanderConfig) {
  return new _Val(commander, commanderConfig);
}

let connectionTimer = null;
let up = Date.now();
let lastPing = Date.now();

valConfig.version = packageJSON.version;
valConfig.req = {
  chalk,
  fs,
  http,
  https,
  request,
};
valConfig.commandModules = [];

const commanders = valConfig.command;
const cores = [];

for (let commander in commanders) {
  const commandObj = commanders[commander];

  if (commandObj.enabled === true) {
    const v = _val(commander, valConfig);
    cores.push(v);
  }
}

const shared = cores.map(({ _bot }) => _bot.shared).filter(Boolean);

cores.forEach(c => {
  const { _bot } = c;

  _bot.sayShared = (user, text, service) => {
    shared.forEach(shareConfig => {
      if (shareConfig.name !== _bot.name) {
        shareConfig.say(user, text, service);
      }
    });
  }
});
