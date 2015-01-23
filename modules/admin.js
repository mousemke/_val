
module.exports  = function Admin( _bot, _modules, userConfig )
{
    return {

        responses : function( from, to, text, botText )
        {
            if ( userConfig.admins.indexOf( to.toLowerCase() ) !== -1 )
            {
                var command = text.slice( ' ' );
                if ( typeof command !== 'string' )
                {
                    command = command[0];
                }
                command = command.slice( 2 );

                switch ( command )
                {
                    case 'v':
                        botText = 'Well, ' + to + ', thanks for asking!  I\'m currently running version ' + userConfig.version;
                        break;
                }
            }

            return botText;
        }
    };
};
