/**
 * _val Modules
 *
 * watch your options property names.  their names should reflect their module, as
 * they are all moved into the same namespace for intercompatability.  All option will be transfered.
 */

module.exports = {
  _8Ball: {
    enabled: true,
    url: './modules/_8ball.js',
  },

  Admin: {
    enabled: true,
    url: './modules/admin.js',
    options: {
      admins: ['user'],
    },
  },

  Beats: {
    enabled: true,
    url: './modules/beats.js',
  },

  CoC: {
    enabled: true,
    url: './modules/coc.js',
    options: {
      cocAdminChannel: 'G0EK1NZPZ',
      cocMaxRetries: 3,
      cocMessage:
        'This is a tight-knit community that strives to create a diverse and inclusive space where all people can feel safe to be themselves. In order to ensure that priniciple, we follow the <https://berlincodeofconduct.org/|Berlin Code of Conduct> [CoC].\n',
      cocReminderFrequency: 5, // in days
      cocReminders: true,
    },
  },

  Crypto: {
    enabled: true,
    url: './modules/crypto.js',
    options: {
      binanceKey: 'api-key',
      binanceSecret: 'api-secret',
    },
  },

  DnD: {
    enabled: true,
    url: './modules/dnd.js',
    options: {
      dndRooms: ['#wizardlands'], // '*' for all
      dndMaxDice: 100,
    },
  },

  Doge: {
    enabled: true,
    url: './modules/doge.js',
  },

  Foursquare: {
    enabled: true,
    url: './modules/_4sq.js',
    options: {
      foursquareID: '4sq ID - go get one',
      foursquareSecret: '4sq secret - go get one',
      latLong: '-88.987,-88.567',
      foursquareSection: 'food', // food, drinks, coffee, shops, arts, outdoors, sights, trending, specials, nextVenues, topPicks
      foursquareRadius: 2000, // in meters
    },
  },

  Gif: {
    enabled: true,
    url: './modules/gif.js',
    options: {
      tenorAPIKey: 'asdfghjkl',
      tenorAnonId: '1234567890',
    },
  },

  Mtg: {
    enabled: true,
    url: './modules/mtg.js',
    options: {
      mtgApiPublicKey: 'public-api-key-here',
      mtgApiPrivateKey: 'private-api-key-here',
      mtgApiAppId: '1382',
      mtgApiBaseUrl: 'api.tcgplayer.com/v1.8.0',
    },
  },

  Nico: {
    enabled: true,
    url: './modules/nico.js',
  },

  PlainText: {
    enabled: true,
    url: './modules/plainText.js',
    options: {
      plainTextFettiWordLength: 15,
      plainTextFettiLength: 25,
      plainTextFettiOptions: ['. ', '´ ', "' ", ' ,'],
    },
  },

  RR: {
    enabled: true,
    url: './modules/rr.js',
  },

  Test: {
    enabled: true,
    url: './modules/test.js',
  },

  Twitter: {
    enabled: true,
    url: './modules/twitter.js',
    options: {
      twitterRooms: {
        mouse: {
          account: '@mousemke',
          users: ['user1'],
          consumerKey: '1234567890',
          consumerSecret: '1234567890',
          accessToken: '1234567890-1234567890',
          accessTokenSecret: '1234567890',
        },
        '#val-test': {
          account: '@mousemke',
          users: ['user1'],
          consumerKey: '1234567890',
          consumerSecret: '1234567890',
          accessToken: '1234567890-1234567890',
          accessTokenSecret: '1234567890',
        },
        '#_teamdoinstuff': {
          account: '@teamdoinstuff',
          users: ['user1', 'user2', 'user3'],
          consumerKey: '1234567890',
          consumerSecret: '1234567890',
          accessToken: '1234567890-1234567890',
          accessTokenSecret: '1234567890',
        },
      },
      twitterUsersBlackList: ['userBad'],
    },
  },

  Words: {
    enabled: true,
    url: './modules/words.js',
    options: {
      wordsLang: 'en',
      wordsChannel: '#bots',
      wordnikBaseUrl: 'http://api.wordnik.com:80/v4/',
      translationBaseUrl: 'http://mymemory.translated.net/api/',
      wordnikAPIKey: 'api-key',
    },
  },

  XKCD: {
    enabled: true,
    url: './modules/xkcd.js',
    options: {
      xkcdAppUrl: 'http://xkcd-imgs.herokuapp.com/',
    },
  },

  U: {
    enabled: true,
    url: './modules/u.js',
  },
};
