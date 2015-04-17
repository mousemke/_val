
module.exports  = function CAH( _bot, _modules, userConfig )
{
    var http            = userConfig.req.http;

    var cahRoom         = userConfig.cahRoom;
    var cards           = {};
    var cardCount       = 0;
    var cardsPlayed     = [];
    var players         = {};
    var playerCount     = 0;
    var timer           = {};
    var activeQuestion  = false;

/*

players : {
    player1 : {
        hand        : [],
        lastPlay    : 0
    }
}


 */


    return {

        addPlayer : function( playerName )
        {
            if ( ! players[ playerName ] )
            {
                players[ playerName ] = { hand: [] };
                var hand = players[ playerName ].hand;

                for ( var i = 0; i < 10; i++ ) 
                {
                    hand[ i ] = this.getCard( 'A' );
                    _bot.say( playerName, ( i + 1 ) + ': ' + hand[ i ] );
                }    

                playerCount++;
                return 'Welcome to the game, ' + playerName + '.  I\'ve sent you your cards';   
            }
            else
            {
                return 'You\'re already playing, ' + playerName;
            }
        },


        drawCard : function( player )
        {
            var card        = this.getCard( 'A' );
            player.hand.push( card );
            card.used       = true;

            return card;
        },


        getCard : function( type )
        {
            var card, cardNumber, tries = 0;

            do
            {
                cardNumber = Math.floor( Math.random() * ( cards.length - 1 ) );
                card = cards[ cardNumber ];
                tries++;
            }
            while ( card.cardType !== type && tries !== cards.length && card.used === false )

            return card;
        },


        ini : function()
        {
            // if ( userConfig.enablePM )
            // {
                this.loadCards();
            // }
            // else
            // {
            //     console.log( 'you must have private messages enabled to run CAH.  unloading module' );
            //     delete modules.cah;
            // }
        },


        loadCards : function()
        {
            var url = '/_val/json/cards.json';

            http.get( url, function( res )
            {
                 var body = '';

                res.on( 'data', function( chunk )
                {
                    body += chunk;
                });

                res.on( 'end', function()
                {
                    cards =  JSON.parse( body );
                });

            } ).on( 'error', function( e )
            {
                console.log( 'Got error: ', e );
            });
        },


        newQuestion : function()
        {
            if ( activeQuestion )
            {
                var min = ( Date.now() - timer ) / 1000 / 60;

                if ( min > 4 )
                {
                    min = Math.floor( ( userConfig.cahMaxMin - min ) * 60 );
                    min = min + ' seconds left!!  '
                }
                else
                {
                    min     = ( userConfig.cahMaxMin - Math.floor( min + 1 ) );
                    var s   = ( min === 1 ) ? '' : 's';
                    min     =  min + ' minute' + s + ' left.  ';
                }

                s   = ( activeQuestion.numAnswers === 1 ) ? '' : 's';
                min += activeQuestion.numAnswers + ' answer' + s + ' required.';

                botText = activeQuestion.text + '\n' + min;
            }
            else
            {
                activeQuestion      = this.getCard( 'Q' );
                activeQuestion.used = true;   
                var numAnswers      = activeQuestion.numAnswers;

                timer               = Date.now();
                botText             = activeQuestion.text;
                if ( numAnswers > 1 )
                {
                    var s   = ( numAnswers === 1 ) ? '.' : 's.';

                    botText += '\nThis question needs ' + numAnswers + ' answer' + s;
                }
            }

            return botText;
        },


        removePlayer : function( playerName )
        {
            var player = players[ playerName ];

            if ( player )
            {
                for ( var i = 0; i < player.hand.length; i++ ) 
                {
                    player.hand[ i ].user = false;
                }

                delete players[ playerName ];
                playerCount--;
                return 'ok, ' + playerName + '. You\'re out of the game';
            }
            else
            {
                return 'Fine. You weren\'t playing anyways.';
            }
        },


        playCard : function( playerName, cardNum )
        {
            cardNum++;

            var player  = players[ playerName ];

            cardsPlayed.push( this.useCard( playerName, cardNum ) );
            var newCard = this.drawCard( player );

            cardCount++;
            if ( cardCount === playerCount )
            {
                // switch to voting round
                cardCount = 0;
            }
        },


        responses : function( from, to, text, botText )
        {
            if ( cahRoom === from )
            {            
                var command = text.slice( ' ' );

                if ( typeof command !== 'string' )
                {
                    command = command[0];
                }

                command = command.slice( 1 );

                switch ( command )
                {
                    case 'play':
                        botText = this.addPlayer( to );
                        break;
                    case 'removePlayer':
                        botText = this.removePlayer( to );
                        break;
                    case 'q':
                        botText = this.newQuestion();
                        break;
                }
            }
            return botText;
        },


        useCard : function( player, cardNum )
        {
            var card                = player.hand[ cardNum ];
            card.used               = false;
            player.hand.splice( cardNum, 1 );

            return card;
        }
    }
};