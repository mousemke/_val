
const Module        = require( './Module.js' );

class PopKey extends Module
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

        this.apikey = userConfig.popKeyAPIKey;
    }


    /**
     * ## getGif
     *
     * pulls in a gif from popkey (or more than one and chooses randomly)
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {Sring} text original text minus command
     *
     * @return {String} gif url
     */
    getGif( from, to, text )
    {
        text = text.replace( / /g, ',' ).toLowerCase().replace( /['"`’]/g, '' );

        const options = {
            path: `/v2/media/search?q=${text}`,
            host: 'api.popkey.co',
            port: 443,
            headers: {
                Authorization: `Basic ${this.apikey}`,
                Accept: '*/*'
            }
        };

        return new Promise( ( resolve, reject ) =>
        {
            this._modules.core.apiGet( options, function( info )
            {
                var length = info.length;

                if ( length )
                {
                    var choose = function()
                    {
                        var _r      = Math.floor( Math.random() * length );
                        var _file   =  info[ _r ];

                        var rating = _file.rating;
                        console.log( `GIF Called.  Rating: ${rating}` );

                        if ( rating === 'E' )
                        {
                            return _file.source.url;
                        }
                        else
                        {
                            return choose();
                        }
                    };

                    resolve( choose() );
                }
                else
                {
                    resolve( 'Nah.... I got nothing' );
                }
            }, true, from, to );

        } );
    }


    /**
     * ## responses
     *
     * @return {Object} responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            gif : {
                f       : this.getGif,
                desc    : 'finds a gif matching the passed query',
                syntax      : [
                    `${trigger}gif <query>`
                ]
            }
        }
    }
};

module.exports  = PopKey;
