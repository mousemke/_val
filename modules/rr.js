var chairs = require( '../lists/chairs.js' );

class RR
{
    constructor( _bot, _modules, userConfig, commandModule )
    {
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;

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
     */
    responses()
    {
        return {
            rr : {
                f       : this.rr,
                desc    : 'try your luck'
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
     * @param {String} botText text to write
     *
     * @return _String_ botText
     */
    rr( from, to, text, botText )
    {
        const clipSize  = this.clipSize;
        let clip        = this.clip;

        var shot    = Math.floor( Math.random() * clipSize );
        var bullet  = clip[ shot ];
        botText     = '';

        if ( bullet === true )
        {
            return this.rr( from, to, text, botText );
        }
        else
        {
            text = text.split( ' ' );

            if ( text[ 1 ] )
            {
                to = text[ 1 ];
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
