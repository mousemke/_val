/**
 * the u conversations
 *
 * based on http://www.flashforwardpod.com/2016/04/05/episode-10-rude-bot-rises/ (5:30)
 *
 * @author  Mouse Braun <mouse@knoblau.ch>
 *
 */
const words = require('../json/u.json');
const Module = require('./Module.js');

class U extends Module {
  /**
   * ## responses
   *
   * @return {Object} responses
   */
  responses() {
    const { trigger } = this.userConfig;

    return {
      commands: {
        u: {
          f: this.talk,
          desc: 'interesting political discussions with someone angry',
          syntax: [`${trigger}u <question>`],
        },
      },
    };
  }

  /**
   * ## talk
   *
   * dont just sit there, u, say something!
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full input string
   * @param {Array} textSplit input string broken up by word
   *
   * @return {String} reply
   */
  talk(from, to, text, textSplit) {
    if (Math.random() > 0.98) {
      return 'mumbles something in binary';
    }

    var _w,
      _ts,
      res = [];

    for (var i = 0, lenI = textSplit.length; i < lenI; i++) {
      _ts = textSplit[i].replace(/\W/g, '').toLowerCase();

      words.forEach(function(_w) {
        const _wSmall = _w.replace(/[^\da-zA-Z\s]/g, '').toLowerCase();

        if (_wSmall.indexOf(_ts) !== -1 && res.indexOf(_wSmall) === -1) {
          res.push(_w);
        }
      });
    }

    return res.length !== 0 ? res[Math.floor(Math.random() * res.length)] : '';
  }
}

module.exports = U;
