
/**
 * this modules uses the Foursquare API (https://developer.foursquare.com/docs/venues/explore)
 * to find places to eat nearby
 */
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
            //
            return new Promise( function( resolve, reject )
            {
                _modules.core.apiGet( url, function( result )
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
                            tipUser += ' ' + tip.user.lastName;
                        }

                        tip         = tipUser + ' says, "' + tip.text + '"';

                        _botText = 'Try ' + name + '\n' + address;

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

                        var venueUrl = name.replace( noSpaces, '-' ) +
                                    '/' + venue.id;

                        resolve( _botText + '\nhttps://foursquare.com/v/' + venueUrl );
                    }

                }, true, from, to );
            } );
        },


        /**
         * 4sq responses
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         * @param {Object} confObj extra config object that some command modules need
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command, confObj )
        {
            switch ( command )
            {
                case 'lunch':
                case 'feedme':
                case 'food':
                    return this.lunch( from, to, text );
                case '4sq-range':
                    return 'Range is set to ' + ( userConfig.foursquareRadius ) + ' meters';
            }

            return botText;
        }

    };
};
