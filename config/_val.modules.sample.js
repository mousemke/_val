/**
 * _val Modules
 */

 module.exports = {
    /**
     * load _val modules
     */
    PlainText   : {
        enabled : true,
        url     : './modules/plainText.js'
    },

    Beats       : {
        enabled : true,
        url     : './modules/beats.js'
    },

    XKCD        : {
        enabled : true,
        url     : './modules/xkcd.js',
        options : {
            appUrl      : 'http://xkcd-imgs.herokuapp.com/'
        }
    },

    Nico        : {
        enabled : true,
        url     : './modules/nico.js'
    },

    Doge        : {
        enabled : true,
        ini     : true,
        url     : './modules/doge.js'
    },    

    Foursquare        : {
        enabled : true,
        url     : './modules/_4sq.js',
        options : {
            foursquareID        : '4sq ID - go get one',
            foursquareSecret    : '4sq secret - go get one',
            latLong             : '-88.987,-88.567',
        }
    },

    Words       : {
        enabled : true,
        ini     : true,
        url     : './modules/words.js',
        options : {
            wordnikBaseUrl          : 'http://api.wordnik.com:80/v4/',
            translationBaseUrl      : 'http://mymemory.translated.net/api/',
            newWordVoteNeeded       : 0.6,
            unscramblePointTimeout  : 86400000, // 24 hours
            unscramble              : '#unscramble',
            wordnikAPIKey           : 'wordnik - it works bitches',
        } 
    },

    Anagramm    : {
        enabled : true,
        ini     : true,
        url     : './modules/anagramm.js',
        options : {
                anagramm                : '#anagramm',
        } 
    },

    Pool        : {
        enabled : true,
        url     : './modules/pool.js',
        options : {
                poolApiUrl              : 'http://192.168.2.15:8001/api/'
        } 
    }
};