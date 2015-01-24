
module.exports  = function Template( _bot, _modules, userConfig )
{
    var apiBaseUrl = 'https://api.testsite.com/v2';


    return {

        test : function()
        {
            var url = apiBaseUrl + '/items';

            _modules.core.apiGet( url, function( result )
            {
                console.log( result )

                // do a thing

            } );

            return null;
        },


        responses : function( from, to, text, botText )
        {

            var textSplit = text.split( ' ' );
            var command = textSplit[ 0 ].slice( 1 );

            if ( userConfig.guildWars2Room !== from && command === userConfig.guildWars2Trigger )
            {
                from = userConfig.guildWars2Room;
                textSplit = textSplit.slice( 1 );
                command = textSplit[ 0 ];
            }

            if ( userConfig.guildWars2Room === from )
            {            
                if ( typeof command !== 'string' )
                {
                    command = command[ 0 ];
                }

                switch ( command )
                {
                    case 'test':
                        botText = this.test();
                        break;
                }
            }
            return botText;
        }
    }
};