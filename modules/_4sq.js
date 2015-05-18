
//4sq api https://developer.foursquare.com/docs/venues/explore
module.exports  = function _4sq( _bot, _modules, userConfig )
{
    return {

        lunch : function( from, to, query )
        {
            var _botText;

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
            _modules.core.apiGet( url, function( result )
            {
                var _valsChoice;
                var venues      = result.response.groups[0].items;
                var venueCount  = venues.length;

                if ( venues.length === 0 )
                {
                    _botText = 'No results...  We shall all starve!';
                }
                else
                {
                    _valsChoice = Math.floor( Math.random() * venueCount );
                    console.log( result.response.groups[0].items.length, _valsChoice );
                    _valsChoice = venues[ _valsChoice ];

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

            }, true, from, to );
        },


        responses : function( from, to, text, botText )
        {
            if ( text[0] === userConfig.trigger )
            {
                text = text.slice( 1 );
            }

            var command = text.split( ' ' )[ 0 ];

            switch ( command )
            {
                case 'lunch':
                case 'feedme':
                    this.lunch( from, to, text );
                    break;
                case '4sq-range':
                    botText = 'Range is set to ' + ( userConfig.foursquareRadius ) + ' meters';
                    break;
            }

            return botText;
        }

    };
};
