var http            = require( 'http' ),
    https           = require( 'https' );

//4sq api https://developer.foursquare.com/docs/venues/explore
module.exports  = function _4sq( _bot, apiGet, userData, userConfig, doge )
{
    return {

        lunch : function( from, query )
        {
            var _botText;

            //DEFAULT i suppose
            var section     = 'food'; // food, drinks, coffee, shops, arts, outdoors, sights, trending, specials, nextVenues, topPicks
            var radius      = '1000'; // in meters
            var intent      = 'browse'; // checkin
            var searchType  = 'explore'; // search

            var noSpaces = new RegExp( ' ', 'g' );

            query = query.split( ' ' ).slice( 1 ).join( '%20' );

            var url = 'https://api.foursquare.com/v2/venues/' + searchType + '?client_id=' + userConfig.foursquareID + '&client_secret=' + userConfig.foursquareSecret + '&v=20130815%20&ll=' + userConfig.latLong + '&llAcc=1000&openNow=1&radius=' + radius;

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

            apiGet( url, function( result )
            {
                var _valsChoice;
                var venues      = result.response.groups[0].items;
                var venueCount  = venues.length;

                if ( result.length === 0 )
                {
                    _botText = 'No results...  We shall all starve!';
                }
                else
                {
                    _valsChoice = venues[ Math.floor( Math.random() * venueCount ) ];
                    var venue   = _valsChoice.venue.name;
                    var phone   = _valsChoice.venue.contact.formattedPhone;
                    var address = _valsChoice.venue.location.address;
                    var url     = _valsChoice.venue.url;



                    var tip     = _valsChoice.tips;
                    var tips    = tip.length;
                    tip         = tip[ Math.floor( Math.random() * tips ) ];
                    var tipUser = tip.user.firstName;
                    if ( tip.user.lastName )
                    {
                        tipUser += ' ' + tip.user.lastName;
                    }

                    tip         = tipUser + ' says, "' + tip.text + '"';

                    _botText = 'Try ' + venue + '\n' + address;

                    if ( phone )
                    {
                        _botText += ' - ' + phone;
                    }
                    if ( url )
                    {
                        _botText += '\n' + url;
                    }
                    if ( tip )
                    {
                         _botText += '\n' + tip;
                    }

                    var venueUrl = _valsChoice.venue.name.replace( noSpaces, '-' ) +
                                '/' + _valsChoice.venue.id;

                    _botText += '\nhttps://foursquare.com/v/' + venueUrl;
                }

                _bot.say( from, _botText );

            }, true );
        },


        responses : function( from, to, text, botText )
        {
            if ( text[0] === userConfig.trigger )
            {
                text = text.slice( 1 );
            }
console.log( text );
            var command = text.split( ' ' )[ 0 ];

            switch ( command )
            {
                case 'lunch':
                case 'feedme':
                    this.lunch( from, text );
                    break;
            }

            return botText;
        }

    };
};
