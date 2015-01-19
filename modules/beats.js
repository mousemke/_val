//86.4 seconds

module.exports = function Beats( _bot, apiGet, userData, userConfig )
{
    return function( from, to, text, botText )
    {
        var command = text.slice( 1 ).split( ' ' )[ 0 ];

        if ( command === 'beat' || command === 'time' )
        {
            var now         = Date.now();
            var Oct231998   = 909097200000;
            var allBeats    = ( ( now - Oct231998 ) / 1000 / 86.4 );
            var beatTime    = Math.floor( allBeats % 1000 );

            if ( beatTime.length < 3 )
            {
                while ( beatTime.length !== 3 )
                {
                    beatTime = '0' + beatTime;
                }
            }

            botText = '@' + beatTime;
        }

        return botText;
    };
};
