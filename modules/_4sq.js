

/**
 * this modules uses the Foursquare API (https://developer.foursquare.com/docs/venues/explore)
 * to find places to eat nearby
 */
class _4sq
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
     * ## getRange
     *
     * returns the current set foursquare radius
     *
     * @return {String} range description
     */
    getRange()
    {
        const userConfig = this.userConfig;

        return `Range is set to ${userConfig.foursquareRadius} meters from ${userConfig.latLong}`;
    }


    /**
     * ## lunch
     *
     * searches for matching places and returns a random one
     * of the results
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} query search parameter
     *
     * @return _Promise_ search results
     */
    lunch( from, to, query )
    {
        var _botText;
        const userConfig = this.userConfig;

        var section     = userConfig.foursquareSection;
        var radius      = userConfig.foursquareRadius;
        var intent      = 'browse'; // checkin
        // var intent      = 'checkin';             // DEBUG
        var searchType  = 'explore'; // search
        // var searchType  = 'search';              // DEBUG

        var noSpaces = new RegExp( ' ', 'g' );

        query = query.split( ' ' ).slice( 1 ).join( '%20' );

        var url = 'https://api.foursquare.com/v2/venues/' + searchType +
                            '?client_id=' + userConfig.foursquareID +
                            '&client_secret=' + userConfig.foursquareSecret +
                            '&v=20130815%20&ll=' + userConfig.latLong +
                            '&llAcc=1000&openNow=1&radius=' + radius;

        if ( query !== '' )
        {
             url += '&query=' + query;
        }
        else
        {
            url += '&section=' + section;
        }

        if ( searchType === 'search' )
        {
            url += '&intent=' + intent;
        }

        // url += '&novelty=new&friendVisits=notvisited';
        // url = 'https://api.foursquare.com/v2/venues/suggestCompletion?ll=' + userConfig.latLong + '&query=' + query;
        //
        return new Promise( ( resolve, reject ) =>
        {
            this._modules.core.apiGet( url, function( result )
            {
                var _valsChoice;
                var venues      = result.response.groups[0].items;
                var venueCount  = venues.length;

                if ( venues.length === 0 )
                {
                    resolve( 'No results...  We shall all starve!' );
                }
                else
                {
                    _valsChoice = Math.floor( Math.random() * venueCount );

                    _valsChoice = venues[ _valsChoice ];
                    var venue   = _valsChoice.venue;
                    var name    = venue.name;
                    var phone   = venue.contact.formattedPhone;
                    var address = venue.location.address;
                    var url     = venue.url;

                    var tip     = _valsChoice.tips;
                    var tips    = tip.length;

                    tip         = tip[ Math.floor( Math.random() * tips ) ];

                    var tipUser = tip.user.firstName;

                    if ( tip.user.lastName )
                    {
                        tipUser += ` ${tip.user.lastName}`;
                    }

                    tip         = `${tipUser} says, "${tip.text}"`;

                    _botText = `Try ${name}\n${address}`;

                    if ( phone )
                    {
                        _botText += ` - ${phone}`;
                    }
                    if ( url )
                    {
                        _botText += `\n${url}`;
                    }
                    if ( tip )
                    {
                         _botText += `\n${tip}`;
                    }

                    var venueUrl = `${name.replace( noSpaces, '-' )}/${venue.id}`;

                    resolve( `${_botText}\nhttps://foursquare.com/v/${venueUrl}` );
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
            '4sq-range' : {
                f           : this.getRange,
                desc        : 'returns the current range and location of the search',
                syntax      : [
                    `${trigger}4sq-range`
                ]
            },


            feedme      : {
                f           : this.lunch,
                desc        : 'don\'t starve',
                syntax      : [
                    `${trigger}feedme`,
                    `${trigger}feedme <query>`
                ]
            },


            food        : {
                f           : this.lunch,
                desc        : 'don\'t starve',
                syntax      : [
                    `${trigger}food`,
                    `${trigger}food <query>`
                ]
            },


            lunch       : {
                f           : this.lunch,
                desc        : 'don\'t starve',
                syntax      : [
                    `${trigger}lunch`,
                    `${trigger}lunch <query>`
                ]
            }
        };
    }
};


module.exports  = _4sq;
