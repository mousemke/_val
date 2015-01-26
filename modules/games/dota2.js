
module.exports  = function Twitch( _bot, _modules, userConfig )
{
    return {

    responses : function( from, to, text, botText )
    {
            var command = text.slice( ' ' );
            if ( typeof command !== 'string' )
            {
                command = command[0];
            }
            command = command.slice( 1 );

            switch ( command )
            {
                case 'ShibeZ':
                    botText = 'ShibeZ';
                    break;
            }

            return botText;
        }
    };
};