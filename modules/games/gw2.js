
// ***** CURRENTLY DISABLED ENDPOINTS *****

    // /v2/accounts [d]
    // /v2/build [d]
    // /v2/characters [d]
    // /v2/colors [l,d]
    // /v2/continents [d]
    // /v2/events [l,d]
    // /v2/events-state [d]
    // /v2/files [d]
    // /v2/floors [l,d]
    // /v2/leaderboards [d]
    // /v2/maps [l,d]
    // /v2/skins [l,d]
    // /v2/wvw/matches [d]
    // /v2/wvw/objectives [l,d]

//*****************************************

module.exports  = function GuildWars2( _bot, _modules, userConfig )
{
    var apiBaseUrl      = userConfig.guildWars2apiUrl;
    var moduleTrigger   = userConfig.guildWars2Trigger;
    var moduleRoom      = userConfig.guildWars2Room;


    return {

        decToGSC : function( price )
        {
            var g, s, c, negative = '';
            price = price.toString();

            if ( price[ 0 ] === '-' )
            {
                price       = price.slice( 1 );
                negative    = '-';
            }

            while ( price.length < 6 )
            {
                price = '0' + price;
            }

            c = price.slice( price.length - 2 );
            s = price.slice( price.length - 4, price.length - 2 );
            g = parseInt( price.slice( 0, price.length - 4 ) );


            var text = c + 'c';

            if ( s !== '00' || g !== 0 )
            {
                text = s + 's ' + text;
            }
            if ( g !== 0 )
            {

                text = g + 'g ' + text;
            }

            while ( text[ 0 ] === '0' )
            {
                text = text.slice( 1 );
            }

            if ( text === 'c' )
            {
                text = '0c';
            }

            return negative + text;
        },



    // /v2/commerce/exchange
    // /v2/commerce/listings
    // /v2/commerce/prices
    // /v2/items [l]
    // /v2/quaggans
    // /v2/recipes
    // /v2/recipes/search
    // /v2/worlds [l]


        test : function( from, to )
        {
            var url = apiBaseUrl + '/items';

            _modules.core.apiGet( url, function( result )
            {
                console.log( result );

                // do a thing

            }, false, from, to );

            return botText;
        },


        responses : function( from, to, text, botText )
        {

            var textSplit = text.split( ' ' );
            var command = textSplit[ 0 ].slice( 1 );

            if ( moduleRoom !== from && command === moduleTrigger &&
                textSplit.length > 1 )
            {
                from = moduleRoom;
                textSplit = textSplit.slice( 1 );
                command = textSplit[ 0 ];
            }

            if ( moduleRoom === from )
            {
                if ( typeof command !== 'string' )
                {
                    command = command[ 0 ];
                }

                switch ( command )
                {
                    case 'test':
                        botText = this.test( from, to );
                        break;
                    case 'gsc':
                        botText = this.decToGSC( textSplit[ 1 ] );
                        break;
                }
            }
            return botText;
        }
    }
};