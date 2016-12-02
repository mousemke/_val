
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
        accessTokenSecret,
        account,
        users
    } = twitterConfig;

    const _bot = new Twit( {
        consumer_key        : consumerKey,
        consumer_secret     : consumerSecret,
        access_token        : accessToken,
        access_token_secret : accessTokenSecret
    } );

    _bot.account        = account;
    _bot.users          = users;

    userConfig.commandModules.push( _bot );

    const boundListenToMessages = listenToMessages.bind( context );

    _bot.say = function( to, text )
    {
        console.log( to, text );
        // const answer = new Message()
        //                 .text( text )
        //                 .to( to );
        // _bot.send( answer );
    };

    const stream = _bot.stream( 'statuses/filter', { track : '@_galaxypotato' } );

    stream.on( 'tweet', tweet =>
    {
        const to        = tweet.text.slice( 0, 1 );
        const from      = tweet.user;
        const text      = tweet.text.slice( 1 );

        const botText   = boundListenToMessages( to, from, text );

        if ( botText )
        {
            _bot.say( from, botText );
        }
    } );

    return _bot;
};