
module.exports  = function Pool( _bot, _modules, userConfig )
{
    return {

        displayLeaderboard : function( from, to, text )
        {
            var botText, url = ( userConfig.poolApiUrl ) + 'players',
            textSplit   = text.split( ' ' ),
            wordOrNum   = parseInt( textSplit[ 1 ], 10 ),
            count;

            if ( textSplit[ 0 ] === 'pool' )
            {
                if ( isNaN( wordOrNum ) && typeof textSplit[ 1 ] !== 'undefined' )
                {
                    count = textSplit[ 1 ];
                    url += '/' + count;
                }
                else
                {
                    count = isNaN( wordOrNum ) ? 5 : wordOrNum;
                    url += '?sort=desc&limit=' + count;
                }

                if ( count !== 1 )
                {
                    botText = 'the top ' + count + ' pool players in Sociomantic are:\n';
                }
                else
                {
                    botText = 'the top pool player in Sociomantic is:\n';
                }

                _modules.core.apiGet( url, function( players )
                {
                    var player;
                    if ( typeof count === 'number' )
                    {
                        var rank = 1;

                        for ( var i = 0, length = players.length; i < length; i++ )
                        {
                            player = players[i];

                            botText += ( rank++ ) + ' - ' + player.name + ' (' +
                                        player.wins  + ':' + player.losses + ')';

                            if ( i < length - 1 )
                            {
                                botText += ', ';
                            }
                        }
                    }
                    else if ( typeof count === 'string' )
                    {
                        player = players;
                        if ( player.score )
                        {
                            botText = count + ' a ' + ( player._score ) + '% win rate. ( ' + ( player.wins ) + ':' + ( player.losses ) + ' )';
                        }
                        else if ( player.score === null || player.score === 0 )
                        {
                            botText = count + ' has never won a game. ( ' + ( player.wins ) + ':' + ( player.losses ) + ' )';
                        }
                        else
                        {
                            botText = 'are you sure that\'s an actual person?';
                        }
                    }
                    _bot.say( from, botText );

                }, false );
            }
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
                case 'pool':
                    this.displayLeaderboard( from, to, text );
                    break;
            }

            return botText;
        }
    };
};


