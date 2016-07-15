
// https://github.com/ttezel/twit
var Twit = require('twit');

module.exports  = function Twitter( _bot, _modules, userConfig )
{
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
            var twitterRooms    = userConfig.twitterRooms;
            var _t              = twitterRooms[ from ] || twitterRooms[ '*' ];

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
         * ## getFollowers
         *
         * gets the followers of the names or attached twitter account
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} _text full input string
         *
         * @return _Void_
         */
        getFollowers : function( from, to, _text )
        {
            var _t = this.authenticate( from );

            return new Promise( function( resolve, reject )
            {
                _t.get( 'followers/list', { screen_name : _text },  function ( err, data, response )
                {
                    if ( err )
                    {
                        console.log( err );
                        resolve( err );
                    }
                    else
                    {
                        var _u = '';
                        data.users.forEach( function( user )
                        {
                            _u += user.name + ' (@' + user.screen_name + ') - ' + user.url + '\n';
                        } );

                        resolve( _u );
                    }
                } );
            } );
        },


        /**
         * ## getFollowing
         *
         * gets the following of the names or attached twitter account
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} _text full input string
         *
         * @return _Void_
         */
        getFollowing : function( from, to, _text )
        {
            var _t = this.authenticate( from );

            return new Promise( function( resolve, reject )
            {
                _t.get( 'friends/list', { screen_name : _text },  function ( err, data, response )
                {
                    if ( err )
                    {
                        console.log( err );
                        resolve( err );
                    }
                    else
                    {
                        var _u = '';
                        data.users.forEach( function( user )
                        {
                            _u += user.name + ' (@' + user.screen_name + ') - ' + user.url + '\n';
                        } );

                        resolve( _u );
                    }
                } );
            } );
        },


        getSlug : function( from, to, _text )
        {
            var _t  = this.authenticate( from );

            _t.get( 'users/suggestions/:slug', { slug : _text }, function ( err, data, response )
            {
                console.log( data )
            } );
        },


        /**
         * ## getStreamEvent
         *
         * used by streamRaw.  checks the given event and uses it if valid or
         * defaults to tweet
         *
         * @param {Array} _text split text object
         *
         * @return _String_ chosen event
         */
        getStreamEvent : function( _text )
        {
            var _event;

            switch ( _text[ 0 ] )
            {
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
                    _event = _text[ 0 ];
                    _text = _text.slice( 1 );
                    break;
                default:
                    _event = 'tweet';
            }

            return _event;
        },


        /**
         * ## getStreamTarget
         *
         * used by streamRaw.  checks the given target and uses it if valid or
         * defaults to 'statuses/filter'
         *
         * @param {Array} _text split text object
         *
         * @return _String_ chosen target
         */
        getStreamTarget : function( _text )
        {
            var target;

            switch ( _text[ 0 ] )
            {
                case 'filter':
                case 'sample':
                case 'firehose':
                    target  = 'statuses/' + _text[ 0 ];
                    _text   = _text.slice( 1 );
                    break;
                case 'user':
                case 'site':
                    target  = _text[ 0 ];
                    _text   = _text.slice( 1 );
                    break;
                default:
                    target  = 'statuses/filter';
            }

            return target;
        },


        /**
         * ## ini
         *
         * builds the streams object
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
         * main i/o for the twitter module
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command )
        {
            var twitterRooms    = userConfig.twitterRooms;
            var _t              = twitterRooms[ from ] || twitterRooms[ '*' ];

            var lowercaseTo = to.toLowerCase();

            if ( _t )
            {
                if ( _t.users.indexOf( lowercaseTo ) !== -1 || _t.users[0] === '*' )
                {
                    if ( userConfig.twitterUsersBlackList.indexOf( lowercaseTo ) === -1 )
                    {
                        var textSplit = text.split( ' ' );

                        var realText = textSplit.slice( 1 ).join( ' ' );

                        switch ( command )
                        {
                            case 't':
                            case 'tweet':
                                return this.tweet( from, to, realText );

                            case 't-stream':
                            case 't-stream-filter':
                                return this.streamFilter( from, to, realText );

                            case 't-stream-stop':
                                return this.streamStop( from, to, realText );

                            case 't-stream-raw':
                                return this.streamRaw( from, to, realText );

                            case 't-following':
                                return this.getFollowing( from, to, realText );

                            case 't-followers':
                                return this.getFollowers( from, to, realText );

                            case 't-slug':
                                return this.getSlug( from, to, realText );
                        }
                    }
                }
            }

            return botText;
        },


        // searchTwitter : function( from, to, _text )
        // {
        //     var _t          = this.authenticate( from );
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
         * @param {String} filter text
         *
         * @return _String_ success message
         */
        stream : function( from, target, _event, searchText )
        {
            var _t          = this.authenticate( from );
            var streams     = this._tStreams[ from ] = this._tStreams[ from ] || [];

            var stream;
            if ( searchText )
            {
                stream      = _t.stream( target, { track : searchText } );
            }
            else
            {
                stream      = _t.stream( target );
            }

            streams.push( stream );

            stream.on( _event, function ( tweet )
            {
                var text = tweet.text;

                if ( text.slice( 0, 2 ) !== 'RT' )
                {
                    var user = tweet.user;
                    _bot.say( from, user.name + ' (@' + user.screen_name + ')\n' + text );
                }
            } );

            return 'Stream started';
        },


        /**
         * ## streamFilter
         *
         * builds a 'statuses/filter' tweet stream filtered by the given text
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         *
         * @return _String_ success message
         */
        streamFilter : function( from, to, text )
        {
            var searchText  = text.split( ' ' ).join( ',' );

            this.stream( from, 'statuses/filter', 'tweet', searchText );

            return 'Filtered tweet stream for ' + searchText + ' started';
        },


        /**
         * ## streamRaw
         *
         * builds a raw tweet stream filtered by the given text
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         *
         * @return _String_ success message
         */
        streamRaw : function( from, to, text )
        {
            var searchText  = text.split( ' ' );

            var target = this.getStreamTarget( searchText );
            var _event = this.getStreamEvent( searchText );

            var searchText  = searchText.join( ',' );

            this.stream( from, target, _event, searchText );

            return target + ' ' + _event + ' stream for ' + searchText + ' started';
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
        streamStop : function( from, to, text )
        {
            var streams = this._tStreams[ from ] = this._tStreams[ from ] || [];

            for ( var i = 0, lenI = streams.length; i < lenI; i++ )
            {
                streams[ i ].stop();
            }

            return 'Streams in ' + from + ' stopped';
        },


        /**
         * ## streamUser
         *
         * builds a 'user' tweet stream filtered by the given text
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         *
         * @return _String_ success message
         */
        streamUser : function( from, to, text )
        {
            var searchText  = text.split( ' ' ).join( ',' );

            this.stream( from, 'user', 'tweet', searchText );

            return 'User tweet stream for ' + searchText + ' started';
        },


        /**
         * ## tweet
         *
         * sends a tweet with the <text> text
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full message text
         *
         * @return _String_ success message
         */
        tweet : function( from, to, text )
        {
            return new Promise( function( resolve, reject )
            {
                if ( text.length > 140 )
                {
                    resolve( 'psst... ' + to + ', twitter only supports 140 characters' );
                }
                else
                {
                    var _t = this.authenticate( from );

                    _t.post( 'statuses/update', { status : text }, function( err, data, response )
                    {
                        if ( err )
                        {
                            resolve( 'Sorry ' + to + ', ' + err.code + ' : ' + err.message );
                        }
                        else
                        {
                            resolve( 'Tweet Posted to ' + _t.account + ': ' + text );
                        }
                    } );
                }
            } );
        }
    }
};
