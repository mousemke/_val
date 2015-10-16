
var Twit = require('twit');
// https://github.com/ttezel/twit


module.exports  = function Twitter( _bot, _modules, userConfig )
{
    var apikey      = userConfig.popKeyAPIKey;

    return {

        ini : function()
        {
            this.t = new Twit( {
                consumer_key        : userConfig.twitterConsumerKey,
                consumer_secret     : userConfig.twitterConsumerSecret,
                access_token        : userConfig.twitterAccessToken,
                access_token_secret : userConfig.twitterAccessTokenSecret
            } );
        },


        responses : function( from, to, text, botText )
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
                case 't-stream':
                    botText = this.stream( from, to, realText );
                    break;
            }

            return botText;
        },


        stream  : function()
        {
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


        tweet   : function( from, to, text )
        {
            var t = this.t;
            // T.post(path, [params], function (err, data, response){} )
            //
            // t.post( 'statuses/update', { status: '_val twitter module test.  find out more at https://github.com/mousemke/_val/tree/0.2.2' }, function( err, data, response )
            // {
            //   console.log( data );
            // } );
            return '';
        }
    }
};

