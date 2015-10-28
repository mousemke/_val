
var Twit = require('twit');
// https://github.com/ttezel/twit

module.exports  = function Twitter( _bot, _modules, userConfig )
{
    var apikey      = userConfig.popKeyAPIKey;

    return {

        /**
         * ## authenticate
         *
         * given twitter info, this authorizses the api for the accounr
         *
         * @param  {String} from room or person name
         *
         * @return _Object_ Twit object
         */
        authenticate : function( from )
        {
            var _t      = userConfig.twitterRooms[ from ];

            var auth    = new Twit( {
                consumer_key        : _t.consumerKey,
                consumer_secret     : _t.consumerSecret,
                access_token        : _t.accessToken,
                access_token_secret : _t.accessTokenSecret
            } );

            auth.account    = _t.account;
            auth.users      = _t.users;

            return auth;
        },


        /**
         * ## ini
         *
         * builds the streams
         *
         * @return _Void_
         */
        ini : function()
        {
            this._tStreams = {};
        },


        /**
         * ## responses
         *
         * main i/o for the module
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         * @param {String} botText old botText
         *
         * @return _String_ new botText
         */
        responses : function( from, to, text, botText )
        {
            var _t          = userConfig.twitterRooms[ from ];
            var lowercaseTo = to.toLowerCase();

            if ( _t )
            {
                if ( _t.users.indexOf( lowercaseTo ) !== -1 )
                {
                    if ( userConfig.twitterBlackUsers.indexOf( lowercaseTo ) === -1 )
                    {
                        var textSplit = text.split( ' ' );
                        var command = textSplit[ 0 ].slice( 1 );

                        if ( typeof command !== 'string' )
                        {
                            command = command[ 0 ];
                        }
                        var realText = textSplit.slice( 1 ).join( ' ' );

                        switch ( command )
                        {
                            case 't':
                            case 'tweet':
                                botText = this.tweet( from, to, realText );
                                break;
                            case 't-stream-filter':
                                botText = this.streamFilter( from, to, realText );
                                break;
                            case 't-stream-stop':
                                botText = this.streamStop( from, to, realText );
                                break;
                        }
                    }
                }
            }

            return botText;
        },


        stream  : function( from, to, text )
        {
            var _t = this.authenticate( from );

            var streams = this._tStreams[ from ] = this._tStreams[ from ] || [];

            var stream = _t.stream( 'statuses/filter', { track : [ 'bananas', 'oranges', 'strawberries' ] } );
            streams.push( stream );

            stream.on( 'tweet', function ( tweet )
            {
                _bot.say( from, tweet.user.name + ' @' + tweet.user.screen_name + '\n' + tweet.text );
            } );

            return 'Stream started';

            // T.stream(path, [params])
            //
            // 'statuses/filter'
            // 'statuses/sample'
            // 'statuses/firehose'
            // 'user'
            // 'site'

            // I only want to see tweets about my favorite fruits
            // same result as doing { track: 'bananas,oranges,strawberries' }
            // var stream = T.stream('statuses/filter', { track: ['bananas', 'oranges', 'strawberries'] })

            // stream.on('tweet', function (tweet) {
            //   //...
            // })
            //

            //  filter the twitter public stream by the word 'mango'.
            // var stream = T.stream('statuses/filter', { track: 'mango' })

            // stream.on('tweet', function (tweet) {
            //   console.log(tweet)
            // })
            //
            // stream events
            // =============
            // message
            // tweet
            // delete
            // limit
            // scrub_geo
            // disconnect
            // connect
            // connected
            // reconnect
            // warning
            // status_withheld
            // user_withheld
            // friends
            // direct_message
            // user_event
            // blocked
            // unblocked
            // favorite
            // unfavorite
            // follow
            // unfollow
            // user_update
            // list_created
            // list_destroyed
            // list_updated
            // list_member_added
            // list_member_removed
            // list_user_subscribed
            // list_user_unsubscribed
            // unknown_user_event
        },


        streamFilter  : function( from, to, text )
        {
            var _t          = this.authenticate( from );
            var streams     = this._tStreams[ from ] = this._tStreams[ from ] || [];
            var searchText  = text.split( ' ' ).join( ',' );

            var stream = _t.stream( 'statuses/filter', { track : searchText } );
            streams.push( stream );

            stream.on( 'tweet', function ( tweet )
            {
                _bot.say( from, tweet.user.name + ' @' + tweet.user.screen_name + '\n' + tweet.text );
            } );

            return 'Filter stream for ' + searchText + ' started';
        },


        /**
         * ## streamStop
         *
         * stops all streams in the current room
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         *
         * @return _String_ success message
         */
        streamStop  : function( from, to, text )
        {
            var streams = this._tStreams[ from ] = this._tStreams[ from ] || [];

            for ( var i = 0, lenI = streams.length; i < lenI; i++ )
            {
                streams[ i ].stop();
            }

            return 'Streams in ' + from + ' stopped';
        },


        tweet   : function( from, to, text )
        {
            var _t = this.authenticate( from );

            _t.post( 'statuses/update', { status : text }, function( err, data, response )
            {
                if ( err )
                {
                    _bot.say( from, 'Sorry ' + to + ', ' + err.code + ' : ' + err.message );
                }
                else
                {
                    _bot.say( from, 'Tweet Posted to ' + _t.account + ': ' + text );
                }
            } );
        }
    }
};

