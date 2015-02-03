
module.exports  = function Template( _bot, _modules, userConfig )
{
    var apiBaseUrl      = userConfig.TEMPLATEapiBaseUrl;
    var moduleTrigger   = userConfig.TEMPLATETrigger;
    var moduleRoom      = userConfig.TEMPLATERoom;

    return {

        test : function( botText )
        {
            var url = apiBaseUrl + '/items';

            _modules.core.apiGet( url, function( result )
            {
                console.log( result )

                // do a thing

            } );

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
                        botText = this.test();
                        break;
                }
            }
            return botText;
        }
    }
};