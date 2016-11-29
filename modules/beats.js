//86.4 seconds

class Beats
{
    constructor( _bot, _modules, userConfig, commandModule )
    {
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
    }

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
    getBeat()
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

        return `@${beatTime}`;
    }


    /**
     * ## responses
     */
    responses()
    {
        return {
            beat      : {
                f           : this.getBeat,
                desc        : 'returns the current time in beats'
            },

            time      : {
                f           : this.getBeat,
                desc        : 'returns the current time in beats'
            }
        };
    }
};

module.exports = Beats;
