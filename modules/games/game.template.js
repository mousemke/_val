
module.exports  = function Template( _bot, _modules, userConfig )
{
    var apiBaseUrl      = userConfig.TEMPLATEapiBaseUrl;
    var moduleTrigger   = userConfig.TEMPLATETrigger;
    var moduleRoom      = userConfig.TEMPLATERoom;

    return {

        test : function( from, to )
        {
            var url = apiBaseUrl + '/items';

            _modules.core.apiGet( url, function( result )
            {
                console.log( result );

                // do a thing

            }, false, from, to );

            return botText;
        },


        /**
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command, confObj )
        {

            var textSplit = text.split( ' ' );

            if ( moduleRoom !== from && command === moduleTrigger &&
                textSplit.length > 1 )
            {
                from = moduleRoom;
                textSplit = textSplit.slice( 1 );
                command = textSplit[ 0 ];
            }

            if ( moduleRoom === from )
            {
                if ( typeof command !== 'string' )
                {
                    command = command[ 0 ];
                }

                switch ( command )
                {
                    case 'test':
                        botText = this.test( from, to );
                        break;
                }
            }
            return botText;
        }
    }
};