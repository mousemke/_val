
const Module    = require( './Module.js' );


class XKCD extends Module
{
    /**
     * ## getComic
     *
     * retrieves and returns a random comic
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
