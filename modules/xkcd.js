
class XKCD
{
    constructor( _bot, _modules, userConfig, commandModule )
    {
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
    }


    getComic( from, to, text, botText )
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
        return {
            xkcd : {
                f       : this.getComic,
                desc    : 'returns a random xkcd cominc'
            }
        };
    }
};


module.exports  = XKCD
