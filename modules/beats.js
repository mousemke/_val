//86.4 seconds

module.exports = function Beats( _bot, _modules, userConfig, commandModule )
{
    return {

        /**
         * ## beats
         *
         * if called, this returns the current time converted to beats
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
            if ( command === 'beat' || command === 'time' )
            {
                var now         = Date.now();
                var Oct231998   = 909097200000;
                var allBeats    = ( ( now - Oct231998 ) / 1000 / 86.4 );
                var beatTime    = Math.floor( allBeats % 1000 );

                if ( beatTime.length < 3 )
                {
                    while ( beatTime.length !== 3 )
                    {
                        beatTime = `0${beatTime}`;
                    }
                }

                botText = `@${beatTime}`;
            }

            return botText;
        }
    };
};
