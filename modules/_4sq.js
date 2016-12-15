
const Module        = require( './Module.js' );

/**
 * this modules uses the Foursquare API (https://developer.foursquare.com/docs/venues/explore)
 * to find places to eat nearby
 */
class _4sq extends Module
{
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
     * @return {Promise} search results
     */
    lunch( from, to, query )
    {
        const {
            foursquareSection,
            foursquareRadius,
            foursquareID,
            foursquareSecret,
            latLong
             } = this.userConfig;

        const intent      = 'browse'; // checkin
        // const intent      = 'checkin';             // DEBUG
        const searchType  = 'explore'; // search
        // const searchType  = 'search';              // DEBUG

        const noSpaces = new RegExp( ' ', 'g' );

        query = query.split( ' ' ).slice( 1 ).join( '%20' );

        let url = `https://api.foursquare.com/v2/venues/${searchType}?client_id=${foursquareID}&client_secret=${foursquareSecret}&v=20130815%20&ll=${latLong}&llAcc=1000&openNow=1&radius=${foursquareRadius}`;

        if ( query !== '' )
        {
             url += `&query=${query}`;
        }
        else
        {
            url += `&section=${foursquareSection}`;
        }

        if ( searchType === 'search' )
        {
            url += `&intent=${intent}`;
        }

        // url += '&novelty=new&friendVisits=notvisited';
        // url = `https://api.foursquare.com/v2/venues/suggestCompletion?ll=${latLong}&query=${query}`;
        //
        return new Promise( ( resolve, reject ) =>
        {
            this._modules.core.apiGet( url, function( result )
            {
                try {
                const venues     = result.response.groups[0].items;
                const venueCount = venues.length;

                if ( venues.length === 0 )
                {
                    resolve( 'No results...  We shall all starve!' );
                }
                else
                {
                    const valsChoice = venues[ Math.floor( Math.random() * venueCount ) ];

                    const { venue, tips } = valsChoice;
                    const {
                        contact,
                        name,
                        location,
                        url,
                        id
                    } = venue;


                    const tipCount  = tips.length;
                    const tip       = tips[ Math.floor( Math.random() * tipCount ) ];

                    const { user, text } = tip;

                    const phone     = contact.formattedPhone;
                    const address   = location.address;

                    let tipUser     = user.firstName;

                    if ( user.lastName )
                    {
                        tipUser += ` ${user.lastName}`;
                    }

                    const tipText   = `${tipUser} says, "${text}"`;
                    let botText     = `Try ${name}\n${address}`;

                    if ( phone )
                    {
                        botText += ` - ${phone}`;
                    }

                    if ( url )
                    {
                        botText += `\n${url}`;
                    }

                    if ( tipText )
                    {
                         botText += `\n${tipText}`;
                    }

                    const venueUrl = `${name.replace( noSpaces, '-' )}/${id}`;

                    resolve( `${botText}\nhttps://foursquare.com/v/${venueUrl}` );
                }
            }
            catch(e){ console.log( e )}

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
