var chairs = require( '../lists/chairs.js' );

/* russian roulette */
module.exports  = function RR( _bot, _modules, userConfig )
{
    var clip        = [];
    var clipSize    = 6;

    return {

        ini : function()
        {
            this.reload();
        },


        reload : function( botText )
        {
            for ( var i = 0, lenI = clipSize; i < lenI; i++ )
            {
                clip[ i ] = false;
            }

            clip[ Math.floor( Math.random() * clipSize ) ] = 'bang!';

            return botText + '\nReloading...';
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
                case 'rr':
                    return this.rr( from, to, text );
                    break;
            }

            return botText;
        },


        rr : function( from, to, text, botText )
        {
            var shot    = Math.floor( Math.random() * clipSize );
            var bullet  = clip[ shot ];
            botText     = '';

            if ( bullet === true )
            {
                return this.rr( from, to, text, botText );
            }
            else
            {
                if ( bullet === 'bang!' )
                {
                    var chairType = chairs[ Math.floor( Math.random() * chairs.length ) ];
                    botText += 'BANG!  A lifeless body slumps forward in ' + to + '\'s ' + chairType;
                    clip    = [];
                    return this.reload( botText );
                }
                else
                {
                    botText += 'click.';
                }

                clip[ shot ] = true;
            }

            return botText;
        }
    };
};
