
// https://github.com/ttezel/twit
/**
 * ## val telegram loader
 *
 * @return _Object_ telegram chatbot
 */
module.exports = function twitterBot( userConfig, _bot, channels, listenToMessages, displayDebugInfo, context )
{
    var Twit            = require( 'twit' );
    var twitterConfig   = userConfig.command.twitter;

    var _bot            = new Twit( {
        consumer_key        : twitterConfig.consumerKey,
        consumer_secret     : twitterConfig.consumerSecret,
        access_token        : twitterConfig.accessToken,
        access_token_secret : twitterConfig.accessTokenSecret
    } );

    _bot.account        = twitterConfig.account;
    _bot.users          = twitterConfig.users;

    userConfig.commandModules.push( _bot );

    var boundListenToMessages = listenToMessages.bind( context );

    _bot.say = function( to, text )
    {
        console.log( to, text );
        // var answer = new Message()
        //                 .text( text )
        //                 .to( to );
        // _bot.send( answer );
    };

    var stream = _bot.stream( 'statuses/filter', { track : '@_galaxypotato' } );

    stream.on( 'tweet', function ( tweet )
    {
        var to      = tweet.text.slice( 0, 1 );
        var from    = tweet.user;
        var text    = tweet.text.slice( 1 );

        var botText = boundListenToMessages( to, from, text );

        if ( botText )
        {
            _bot.say( from, botText );
        }
    } );

    return _bot;
};