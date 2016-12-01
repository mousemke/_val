
class XKCD
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
     * ## getComic
     *
     * rezrieves and returns a random comic
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text full input string
     *
     * @return {String} url
     */
    getComic( from, to, text )
    {
        return new Promise( function( resolve, reject )
        {
            _modules.core.apiGet( userConfig.xkcdAppUrl, function( response )
            {
                resolve( `${response.url}\n${response.title}` );
            }, false, from, to );
        } );
    }


    /**
     * responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            xkcd : {
                f       : this.getComic,
                desc    : 'returns a random xkcd comic',
                syntax  : [
                    `${trigger}xkcd`
                ]
            }
        };
    }
};


module.exports  = XKCD
