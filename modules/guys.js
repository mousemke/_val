
module.exports  = function XKCD( _bot,
    _modules, userConfig )
{
    return {

        replace : function( from, to, text, botText )
        {
            var _alternative    = alternatives[ Math.floor( Math.random() * alternatives.length ];
            var _speech         = speech[ Math.floor( Math.random() * speech.length ];

            return to + ', ' + _speech + _alternative + '...';
        },


        responses : function( from, to, text, botText )
        {
            var go = false;

            for ( var i = 0, lenI = triggers.length; i < lenI; i++ )
            {
                if ( text.indexOf( ' ' + triggers[ i ] + ' ' ) !== -1 )
                {
                    go = true;
                    break;
                }
            }

            if ( go )
            {
                botText = this.replace( text );
            }

            return botText;
        }
    };
};


var triggers = [
    'guys',
    'dudes'
];


var alternatives = [
    'team',
    'squad',
    'gang',
    'pals',
    'buds',
    'posse',
    'phalanx',
    'crew',
    'crüe',
    'nerds',
    'friends',
    'fellow-humans',
    'folks',
    'people',
    'peeps',
    'friends',
    'chums',
    'everyone',
    'you lot',
    'youse',
    'y\'all',
    'peers',
    'comrades'
];

var speech = [
    'I think you meant ',
    'Perhaps you meant ',
    'Surely you meant ',
    'Your probably meant '
];



