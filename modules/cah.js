
module.exports  = function CAH( _bot, _modules, userConfig )
{
    var http            = userConfig.req.http;

    var cahRoom         = userConfig.cahRoom;
    var cards           = {};
    var cardCount       = 0;
    var cardsPlayed     = {};
    var players         = {};
    var playerCount     = 0;
    var timer           = {};
    var questionTimeout = {};
    var activeQuestion  = false;
    var answers         = [];
    var votes           = [];
    var voted           = [];
    var votingRound     = false;
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
                players[ playerName ]       = { hand: [], played : false };
                cardsPlayed[ playerName ]   = [];

                var hand = players[ playerName ].hand;

                var text = '------ CURRENT HAND -----';
                for ( var i = 0; i < 10; i++ )
                {
                    hand[ i ] = this.getCard( 'A' );
                    text += '\n' + ( i + 1 ) + ': ' + hand[ i ].text;
                }

                _bot.say( playerName, text );

                playerCount++;
                return 'Welcome to the game, ' + playerName + '.  I\'ve sent you your cards';
            }
            else
            {
                return 'You\'re already playing, ' + playerName;
            }
        },


        cancelQuestion : function()
        {
            activeQuestion.used = false;
            activeQuestion      = false;

            _bot.say( userConfig.cahRoom, 'Too late.  This question is expired.' );
        },


        /**
         * returns the most common result
         *
         * @param  {arr}                    _arr                array to test
         *
         * @return {int}                                        most common number
         */
        checkMostCommon : function( _arr )
        {
            var res = new Array( playerCount ), common;

            for( var i = 0, lenI = _arr.length;i < lenI; i++ )
            {
                res[ _arr[ i ] ]++;

                if ( !common || res[ _arr[ i ] ] > res[ common ] )
                {
                    common = _arr[ i ];
                }
            }

            return common;
        },


        drawCard : function( player )
        {
            var card        = this.getCard( 'A' );
            player.hand.push( card );
            card.used       = true;

            return card;
        },


        dealCurrentHand : function()
        {
            var text, hand;
            for ( var playerName in players )
            {
                hand = players[ playerName ].hand;

                text = '------ CURRENT HAND -----';
                for ( var i = 0; i < 10; i++ )
                {
                    text += '\n' + ( i + 1 ) + ': ' + hand[ i ].text;
                }

                _bot.say( playerName, text );
            }
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
            while ( card.cardType !== type && tries !== cards.length && card.used === false );

            return card;
        },


        ini : function()
        {
            if ( userConfig.enablePM )
            {
                this.loadCards();
            }
            else
            {
                console.log( 'you must have private messages enabled to run CAH.  unloading module' );
                delete modules.CAH;
            }
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
            var s;

            if ( activeQuestion )
            {
                var min = ( Date.now() - timer ) / 1000 / 60;

                if ( min > 4 )
                {
                    min = Math.floor( ( userConfig.cahMaxMin - min ) * 60 );
                    min = min + ' seconds left!!  ';
                }
                else
                {
                    min     = ( userConfig.cahMaxMin - Math.floor( min + 1 ) );
                    s   = ( min === 1 ) ? '' : 's';
                    min     =  min + ' minute' + s + ' left.  ';
                }

                s   = ( activeQuestion.numAnswers === 1 ) ? '' : 's';
                min += activeQuestion.numAnswers + ' answer' + s + ' required.';

                botText = activeQuestion.text + '\n' + min;
            }
            else
            {
                if ( playerCount > 1 )
                {
                    activeQuestion      = this.getCard( 'Q' );
                    activeQuestion.used = true;
                    var numAnswers      = activeQuestion.numAnswers;

                    timer               = Date.now();

                    questionTimeout     = setTimeout( this.cancelQuestion, ( userConfig.cahMaxMin * 60 * 1000 ) );
                    botText             = activeQuestion.text;
                    if ( numAnswers > 1 )
                    {
                        s   = ( numAnswers === 1 ) ? '.' : 's.';

                        botText += '\nThis question needs ' + numAnswers + ' answer' + s;
                    }
                }
                else
                {
                    botText = 'You need at least 2 players.  Don\'t worry, I\'ll wait';
                }
            }

            _bot.say( userConfig.cahRoom, botText );
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
            var player  = players[ playerName ];

            if ( player && player.played === false )
            {
                cardNum--;

                cardsPlayed[ playerName ].push( this.useCard( playerName, cardNum ) );

                if ( cardsPlayed[ playerName ].length === activeQuestion.numAnswers )
                {
                    player.played = true;
                    cardCount++;
                }
                var newCard = this.drawCard( player );

                if ( cardCount === playerCount )
                {
                    this.switchToVoting();
                }
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

                if ( command === 'play' )
                {
                    botText = this.addPlayer( to );
                }
                else if ( players[ to ] )
                {
                    switch ( command )
                    {
                        case 'quit':
                            botText = this.removePlayer( to );
                            break;
                        case 'question':
                            this.newQuestion();
                            break;
                        case 'players':
                            botText = this.listPlayers();
                            break;
                        default:
                            if ( command.match( /(10|[0-9])/ ) )
                            {
                                if ( votingRound )
                                {
                                    botText = this.vote( to, command );
                                }
                                else
                                {
                                    botText = this.playCard( to, command );
                                }
                            }
                    }
                }
            }
            return botText;
        },


        listPlayers : function()
        {
            var botText = 'current players:';

            for ( var player in players )
            {
                botText += '\n' + player + ' - ';

                if ( votingRound )
                {
                    botText += 'voted: ';
                    botText += voted.indexOf( player ) === -1 ? false : true;
                }
                else
                {
                    botText += 'played: ' + players[ player ].played;
                }
            }

            return botText;
        },

        startVotingRound : function()
        {
            var text = activeQuestion.text + '\nAnswers:';
            var j = 0;
            for ( var player in cardsPlayed )
            {
                j++;
                answers[ j ] = player;
                player = cardsPlayed[ player ];
                text += '\n' + j + ': ';
                for ( var i = 0, lenI = player.length; i < lenI; i++ )
                {
                    if ( i !== 0 )
                    {
                        text += ', ';
                    }
                    text += player[ i ].text;
                }
            }

            text += '\n\n' + 'Cast your vote!';
            _bot.say( userConfig.cahRoom, text );
        },


        switchToVoting : function()
        {
            clearTimeout( questionTimeout );
            timer       = Date.now();

            cardCount   = 0;
            for ( var player in players )
            {
                player.played = false;
            }

            votingRound = true;
            this.startVotingRound();
        },


        useCard : function( player, cardNum )
        {
            player = players[ player ];
            var card                = player.hand[ cardNum ];
            card.used               = false;
            player.hand.splice( cardNum, 1 );

            return card;
        },


        vote : function( player, vote )
        {
            if ( voted.indexOf( player ) === -1 )
            {
                voted.push( player );
                votes.push( vote );

                if ( voted.length === playerCount )
                {
                    votingRound = false;
                    this.votingResult();
                }
            }
            else
            {
                return 'I think you already voted';
            }
        },


        votingResult : function()
        {
            var winner = this.checkMostCommon( votes );
            _bot.say( userConfig.cahRoom, answers[ winner ] + ' wins this round.' );
            activeQuestion = false;
            this.dealCurrentHand();

            for ( var player in cardsPlayed )
            {
                players[ player ].played    = false;
                cardsPlayed[ player ]       = [];
            }

            answers         = [];
            votes           = [];
            voted           = [];

            this.newQuestion();
        }
    };
};