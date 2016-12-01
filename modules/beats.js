//86.4 seconds

class Beats
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
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
    }


    /**
     * ## getBeat
     *
     * if called, this returns the current time converted to beats
     *
     * @return {String} current beat
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
        const { trigger } = this.userConfig;

        return {
            beat      : {
                f           : this.getBeat,
                desc        : 'returns the current time in beats',
                syntax      : [
                    `${trigger}beat`
                ]
            },

            time      : {
                f           : this.getBeat,
                desc        : 'returns the current time in beats',
                syntax      : [
                    `${trigger}time`
                ]
            }
        };
    }
};

module.exports = Beats;
