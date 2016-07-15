
/**
 * this modules contains admin only functions.  they are generally called with
 * a double trigger ( '++', '!!', etc)
 */
module.exports  = function Admin( _bot, _modules, userConfig )
{
    var _channels = userConfig.channels;

    return {


        /**
         * admin responses
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         * @param {Object} confObj extra config object that some command modules need
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command, confObj )
        {
            if ( userConfig.admins.indexOf( to.toLowerCase() ) !== -1  &&
                command[ 0 ] === userConfig.trigger )
            {
                var adminCommand = command.slice( 1 );

                var textSplit   = text.split( ' ' ).slice( 1 );

                switch ( adminCommand )
                {
                    case 'v':
                        return 'Well, ' + to + ', thanks for asking!  I\'m currently running version ' + userConfig.version;
                }
            }

            return botText;
        }
    };
};
