
const Module        = require( './Module.js' );
//86.4 seconds

class Beats extends Module
{
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
