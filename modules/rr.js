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


        /**
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command )
        {
            switch ( command )
            {
                case 'rr':
                    return this.rr( from, to, text );

            }

            return botText;
        },


        /**
         * ## rr
         *
         * take the shot
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text original text
         * @param {String} botText text to write
         *
         * @return _String_ botText
         */
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
                text = text.split( ' ' );

                if ( text[ 1 ] )
                {
                    to = text[ 1 ];
                }

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
