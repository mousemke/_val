
const Module    = require( './Module.js' );
const chairs    = require( '../lists/chairs.js' );

class RR extends Module
{
    /**
     * ## constructor
     *
     * sets the initial "global" variables
     *
     * @param {Object} _bot instance of _Val with a core attached
     * @param {Object} _modules config and instance of all modules
     * @param {Object} userConfig available options
     * @param {Object} commandModule instance of the applied core
     *
     * @return {Void} void
     */
    constructor( _bot, _modules, userConfig, commandModule )
    {
        super( _bot, _modules, userConfig, commandModule );

        this.clip           = [];
        this.clipSize       = 6;

        this.reload();
    }


    reload( botText )
    {
        const clipSize  = this.clipSize;
        const clip      = this.clip;

        for ( var i = 0, lenI = clipSize; i < lenI; i++ )
        {
            clip[ i ] = false;
        }

        clip[ Math.floor( Math.random() * clipSize ) ] = 'bang!';

        return botText + '\nReloading...';
    }


    /**
     * responses
     *
     * @return {Object} responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            commands : {
                rr : {
                    f       : this.rr,
                    desc    : 'try your luck',
                    syntax      : [
                        `${trigger}rr`,
                        `${trigger}rr <name>`
                    ]
                }
            }
        };
    }


    /**
     * ## rr
     *
     * take the shot
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text original text
     *
     * @return _String_ botText
     */
    rr( from, to, text )
    {
        let clip        = this.clip;
        let botText     = '';

        const clipSize  = this.clipSize;
        const _bot      = this._bot;
        const shot      = Math.floor( Math.random() * clipSize );
        const bullet    = clip[ shot ];


        if ( bullet === true )
        {
            return this.rr( from, to, text, botText );
        }
        else
        {
            if ( text && text !== _bot.name )
            {
                to = text;
            }

            if ( bullet === 'bang!' )
            {
                var chairType = chairs[ Math.floor( Math.random() * chairs.length ) ];
                botText += `BANG!  A lifeless body slumps forward in ${to}'s ${chairType}`;
                clip    = [];

                return this.reload( botText );
            }
            else
            {
                botText += 'click.';
            }

            clip[ shot ] = true;
        }

        return botText;
    }
};

module.exports  = RR;
