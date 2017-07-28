
const Module        = require( './Module.js' );

const rollRegex     = /^([0-9]*)d([0-9]+)\+?(\d)?/;

class DND extends Module
{
    /**
     * ## responses
     *
     * @return {Object} responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            commands : {

            },

            regex : {
                [ `${rollRegex}` ] : {
                    module  : 'dnd',
                    f       : this.roll,
                    desc    : 'roll the bones',
                    syntax  : [
                        `${trigger}d10`,
                        `${trigger}16d6`,
                        `${trigger}9d12`
                    ]
                }
            }
        };
    }


    /**
     * ## roll
     *
     * rolls X dice with the Y sides
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text message text
     * @param {Array} textArr text broken into an array of words
     * @param {String} command text that triggered the bot
     * @param {Object} confObj configuration object
     *
     * @return {Void}
     */
    roll( from, to, text, textArr, command, confObj )
    {
        const userConfig    = this.userConfig;

        const dndRooms  = userConfig.dndRooms;
        const maxDice   = userConfig.dndMaxDice;

        let botText = '';

        function exectuteRoll( roll )
        {
            function _getDie( _max )
            {
                return Math.floor( Math.random() * _max ) + 1
            }

            let rolls   = parseInt( roll[ 1 ] );
            const max   = parseInt( roll[ 2 ] );
            const bonus = parseInt( roll[ 3 ] || 0 );

            if ( rolls > maxDice )
            {
                return `Come on ${to}...   do you *really* need that many dice?`;
            }
            else if ( rolls === 0 )
            {
                return `Really? Fine ${to}...   you roll 0d${max}`;
            }

            rolls           = rolls || 1;
            const multiple  = rolls > 1;
            let total       = 0;

            botText = `${to}, your ${rolls}d${max}${bonus ? '+' + bonus : ''} rolls: `;

            for ( let i = 0; i < rolls; i++ )
            {
                if ( multiple && i === rolls - 1 )
                {
                    botText += ' &'
                }

                const result = _getDie( max ) + bonus;
                total       += result;
                botText     += ` ${result}, `;
            }

            botText = botText.slice( 0, botText.length - 2 );

            if ( multiple )
            {
                botText += ` (total: ${total})`;
            }
        }


        if ( dndRooms.indexOf( from ) !== -1 || dndRooms === '*' || 
                dndRooms[ 0 ] === '*' )
        {
            const rollRegex = /^(\d+)?(?:d([0-9][\d]+|[1-9]))(?:[+](\d+))?$/;
            const roll      = rollRegex.exec( command );

            if ( roll && roll[2] )
            {
                exectuteRoll( roll );
            }
        }

        return botText;
    }
};

module.exports = DND;
