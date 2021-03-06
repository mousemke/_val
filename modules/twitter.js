// https://github.com/ttezel/twit
const Twit = require('twit');
const Module = require('./Module.js');

class Twitter extends Module {
  /**
   * ## authenticate
   *
   * given twitter info, this authorizses the api for the accounr
   *
   * @param {String} from room or person name
   * @param {String} to person name
   * @param {Boolean} write whether this is asking for write access
   *
   * @return {Object} Twit object
   */
  authenticate(from, to, write) {
    const userConfig = this.userConfig;
    const twitterRooms = userConfig.twitterRooms;
    const _t = twitterRooms[from] || twitterRooms['*'];

    function auth() {
      const auth = new Twit({
        consumer_key: _t.consumerKey,
        consumer_secret: _t.consumerSecret,
        access_token: _t.accessToken,
        access_token_secret: _t.accessTokenSecret,
      });

      auth.account = _t.account;
      auth.users = _t.users;

      return auth;
    }

    if (write) {
      if (_t) {
        const lowercaseTo = to.toLowerCase();

        if (_t.users.indexOf(lowercaseTo) !== -1 || _t.users[0] === '*') {
          if (userConfig.twitterUsersBlackList.indexOf(lowercaseTo) === -1) {
            return auth();
          }
        }
      }
    } else {
      return auth();
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

    this._tStreams = {};
  }

  /**
   * ## getFollowers
   *
   * gets the followers of the names or attached twitter account
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full input string
   *
   * @return {Void}
   */
  getFollowers(from, to, text) {
    let _t = this.authenticate(from, to);

    return new Promise(function(resolve, reject) {
      _t.get('followers/list', { screen_name: text }, function(
        err,
        data,
        response
      ) {
        if (err) {
          console.log(err);
          resolve(err);
        } else {
          let _u = '';
          data.users.forEach(function(user) {
            _u += `${user.name} (@${user.screen_name}) - ${user.url}\n`;
          });

          resolve(_u);
        }
      });
    });
  }

  /**
   * ## getFollowing
   *
   * gets the following of the names or attached twitter account
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full input string
   *
   * @return {Void}
   */
  getFollowing(from, to, text) {
    let _t = this.authenticate(from, to);

    return new Promise(function(resolve, reject) {
      _t.get('friends/list', { screen_name: text }, function(
        err,
        data,
        response
      ) {
        if (err) {
          console.log(err);
          resolve(err);
        } else {
          let _u = '';
          data.users.forEach(function(user) {
            _u += `${user.name} (@${user.screen_name}) - ${user.url}\n`;
          });

          resolve(_u);
        }
      });
    });
  }

  /**
   * ## getSlug
   *
   * searches twitter for the provided slug
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full input string
   *
   * @return {Void}
   */
  getSlug(from, to, text) {
    let _t = this.authenticate(from, to);

    _t.get('users/suggestions/:slug', { slug: text }, (err, data, response) => {
      console.log(data);
    });
  }

  /**
   * ## getStreamEvent
   *
   * used by streamRaw.  checks the given event and uses it if valid or
   * defaults to tweet
   *
   * @param {Array} _text split text object
   *
   * @return {String} chosen event
   */
  getStreamEvent(_text) {
    let _event;

    switch (_text[0]) {
      case 'message':
      case 'delete':
      case 'limit':
      case 'scrub_geo':
      case 'disconnect':
      case 'connect':
      case 'connected':
      case 'reconnect':
      case 'warning':
      case 'status_withheld':
      case 'user_withheld':
      case 'friends':
      case 'direct_message':
      case 'user_event':
      case 'blocked':
      case 'unblocked':
      case 'favorite':
      case 'unfavorite':
      case 'follow':
      case 'unfollow':
      case 'user_update':
      case 'list_created':
      case 'list_destroyed':
      case 'list_updated':
      case 'list_member_added':
      case 'list_member_removed':
      case 'list_user_subscribed':
      case 'list_user_unsubscribed':
      case 'unknown_user_event':
        _event = _text[0];
        _text = _text.slice(1);
        break;
      default:
        _event = 'tweet';
    }

    return { even };
  }

  /**
   * ## getStreamTarget
   *
   * used by streamRaw.  checks the given target and uses it if valid or
   * defaults to 'statuses/filter'
   *
   * @param {Array} _text split text object
   *
   * @return {String} chosen target
   */
  getStreamTarget(_text) {
    let target;

    switch (_text[0]) {
      case 'filter':
      case 'sample':
      case 'firehose':
        target = `statuses/${_text[0]}`;
        _text = _text.slice(1);
        break;
      case 'user':
      case 'site':
        target = _text[0];
        _text = _text.slice(1);
        break;
      default:
        target = 'statuses/filter';
    }

    return target;
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
        t: {
          f: this.tweet,
          desc: 'compose a new tweet',
          syntax: [`${trigger}t <tweet>`],
        },

        tweet: {
          f: this.tweet,
          desc: 'compose a new tweet',
          syntax: [`${trigger}tweet <tweet>`],
        },

        't-stream': {
          f: this.streamFilter,
          desc: 'starts a new twitter stream based on a keyword',
          syntax: [`${trigger}t-stream <query>`],
        },

        't-stream-filter': {
          f: this.streamFilter,
          desc: 'starts a new twitter stream based on a keyword',
          syntax: [`${trigger}t-stream-filter <query>`],
        },

        't-stream-stop': {
          f: this.streamStop,
          desc: 'stops all twitter streams',
          syntax: [`${trigger}t-stream-stop`],
        },

        't-stream-raw': {
          f: this.streamRaw,
          desc: 'starts a new raw twitter stream based on a keyword',
          syntax: [`${trigger}t-stream-raw <query>`],
        },

        't-stream-user': {
          f: this.streamUser,
          desc: 'starts a new twitter stream based on a user',
          syntax: [`${trigger}t-stream-user <user>`],
        },

        't-following': {
          f: this.getFollowing,
          desc: 'returns a list of the users following',
          syntax: [`${trigger}t-following <user>`],
        },

        't-followers': {
          f: this.getFollowers,
          desc: 'returns a list of the users followers',
          syntax: [`${trigger}t-followers <user>`],
        },

        't-slug': {
          f: this.getSlug,
          desc: 'starts a new slug-based twitter stream',
          syntax: [`${trigger}t-slug <slug>`],
        },
      },
    };
  }

  // searchTwitter( from, to, _text )
  // {
  //     let _t          = this.authenticate( from, to );
  //     _t.get( 'search/tweets', { q: _text, count: 100 }, function( err, data, response )
  //     {
  //         console.log( data )
  //     } );
  // },

  /**
   * ## stream
   *
   * authenticates and initiates the chosen stream
   *
   * @param {String} from originating channel
   * @param {String} target twitter api target
   * @param {String} _event event to watch
   * @param {String} searchText text
   * @param {Object} confObj extra config object that some command modules need
   *
   * @return {String} success message
   */
  stream(from, target, _event, searchText, confObj) {
    let _t = this.authenticate(from);
    let streams = (this._tStreams[from] = this._tStreams[from] || []);

    if (_t) {
      let stream;
      if (searchText) {
        stream = _t.stream(target, { track: searchText });
      } else {
        stream = _t.stream(target);
      }

      streams.push(stream);

      stream.on(_event, tweet => {
        let text = tweet.text;

        if (text.slice(0, 2) !== 'RT') {
          let user = tweet.user;
          this._bot.say(
            from,
            `${user.name} (@${user.screen_name})\n${text}`,
            confObj
          );
        }
      });

      return 'Stream started';
    }
  }

  /**
   * ## streamFilter
   *
   * builds a 'statuses/filter' tweet stream filtered by the given text
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
  streamFilter(from, to, text, textArr, command, confObj) {
    let searchText = text.split(' ').join(',');

    if (searchText !== '') {
      this.stream(from, 'statuses/filter', 'tweet', searchText, confObj);

      return `Filtered tweet stream for ${searchText} started`;
    }

    return `Please definine a filteer term`;
  }

  /**
   * ## streamRaw
   *
   * builds a raw tweet stream filtered by the given text
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
  streamRaw(from, to, text, textArr, command, confObj) {
    let searchText = text.split(' ');

    let target = this.getStreamTarget(searchText);
    let _event = this.getStreamEvent(searchText);

    searchText = searchText.join(',');

    this.stream(from, target, _event, searchText, confObj);

    return `${target} ${_event} stream for ${searchText} started`;
  }

  /**
   * ## streamStop
   *
   * stops all streams in the current room
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full message text
   *
   * @return {String} success message
   */
  streamStop(from, to, text) {
    let streams = (this._tStreams[from] = this._tStreams[from] || []);

    for (let i = 0, lenI = streams.length; i < lenI; i++) {
      streams[i].stop();
    }

    return `Streams in ${from} stopped`;
  }

  /**
   * ## streamUser
   *
   * builds a 'user' tweet stream filtered by the given text
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
  streamUser(from, to, text, textArr, command, confObj) {
    let searchText = text.split(' ').join(',');

    this.stream(from, 'user', 'tweet', searchText, confObj);

    return `User tweet stream for ${searchText} started`;
  }

  /**
   * ## tweet
   *
   * sends a tweet with the <text> text
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full message text
   *
   * @return {String} success message
   */
  tweet(from, to, text) {
    return new Promise((resolve, reject) => {
      if (text.length > 140) {
        resolve(`psst... ${to}, twitter only supports 140 characters`);
      } else {
        let _t = this.authenticate(from, to);

        if (_t) {
          _t.post(
            'statuses/update',
            { status: text },
            (err, data, response) => {
              if (err) {
                resolve(`Sorry ${to}, ${err.code} : ${err.message}`);
              } else {
                resolve(`Tweet Posted to ${_t.account}: ${text}`);
              }
            }
          );
        } else {
          resolve('');
        }
      }
    });
  }
}

module.exports = Twitter;
