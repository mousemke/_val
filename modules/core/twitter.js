
// https://github.com/ttezel/twit
/**
 * ## val twitter loader
 *
 * @return {Object} twitter chatbot
 */
module.exports = function twitterBot( userConfig, channels, listenToMessages, displayDebugInfo, context, twitterConfig )
{
    const Twit          = require( 'twit' );

    const {
        consumerKey,
        consumerSecret,
        accessToken,
        accessTokenSecret
    } = twitterConfig;

    const _bot = new Twit( {
        consumer_key        : consumerKey,
        consumer_secret     : consumerSecret,
        access_token        : accessToken,
        access_token_secret : accessTokenSecret
    } );


    userConfig.commandModules.push( _bot );

    const boundListenToMessages = listenToMessages.bind( context );

    _bot.say = function( to, text )
    {
        const tweet = {
            status  : `${to} ${text}`
        };

        _bot.post( 'statuses/update', tweet, ( err, data, response ) =>
        {
            if ( err )
            {
                console.log( 'error:', err );
            }
        } );
    };

    const stream = _bot.stream( 'statuses/filter', { track : '@_galaxypotato' } );

    stream.on( 'tweet', tweet =>
    {
        // const to        = `@${tweet.in_reply_to_screen_name}`;
        const from      = `@${tweet.user.screen_name}`;
        const text      = tweet.text;
        const botText   = boundListenToMessages( '', from, text );

        if ( botText )
        {
            _bot.say( from, botText.slice( 0, 140 ) );
        }
    } );

    return _bot;
};