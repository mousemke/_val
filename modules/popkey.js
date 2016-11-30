
class PopKey
{
    constructor( _bot, _modules, userConfig, commandModule )
    {
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
        this.apikey         = userConfig.popKeyAPIKey;
    }


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
