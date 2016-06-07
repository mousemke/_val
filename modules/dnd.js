
module.exports  = function CAH( _bot, _modules, userConfig )
{
    var fs              = userConfig.req.fs;

    var dndRooms        = userConfig.dndRooms;
    var rollRegex       = /^(\d+)?(?:d([\d]+))(?:[+](\d+))?$/;

    return {


        /**
         * possible responses to commands
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
            if ( dndRooms.indexOf( from ) !== -1 || dndRooms === '*' )
            {
                var roll    = rollRegex.exec( command );

                if ( roll && roll[2] )
                {
                    botText = this.roll( from, to, text, roll )
                }
                else
                {
                    // switch ( command )
                    // {
                    //     case 'players':
                    //         botText = this.listPlayers();
                    //         break;
                    // }
                }
            }

            return botText;
        },


        /**
         * roll
         *
         * rolls a die with the given sides
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text message text
         *
         * @return _Void_
         */
        roll : function( from, to, text, roll )
        {
            function _getDie( _max )
            {
                return Math.floor( Math.random() * _max ) + 1
            }


            var rolls       = parseInt( roll[ 1 ] || 1 );
            var max         = parseInt( roll[ 2 ] );
            var multiple    = rolls > 1;
            var bonus       = parseInt( roll[ 3 ] || 0 );
            var total       = 0;

            botText = to + ', your ' + text + ' rolls: ';

            for ( var i = 0; i < rolls; i++ )
            {
                if ( multiple && i === rolls - 1 )
                {
                    botText += ' &'
                }

                var result  = _getDie( max + bonus );
                total       += result;
                botText     += ' ' + result + ', ';
            }

            botText = botText.slice( 0, botText.length - 2 );

            if ( multiple )
            {
                botText += ' (total: ' + total + ')';
            }

            return botText;
        },
    };
};