/**
 * IMPORTANT!!!
 *
 * this is *NOT* usable module from anything IRC based.  This is a
 * prototype connection module
 */
var Telegram = require( 'telegram-api' ).default;
var Message = require( 'telegram-api/types/Message');
var File    = require( 'telegram-api/types/File' );

module.exports  = function Twitter( _bot, _modules, userConfig )
{
    var apikey  = userConfig.telegramAPIKey;

    return {

        responses : function( from, to, text, botText, command )
        {
            return botText;
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
            var tBot = new Telegram( {
                token   : apikey
            } );

            tBot.start();

            tBot.get( /./, function( message )
            {
                console.log( message );
                // var answer = new Message()
                //                 .text( 'Hi! \\o' + message.chat.id )
                //                 .to( message.chat.id );
                // tBot.send( answer );
            });
        }
    }
};
