
module.exports  = function CAH( _bot, _modules, userConfig )
{
    var fs              = userConfig.req.fs;

    var cahRoom         = userConfig.cahRoom;
    var cards           = {};
    var cardsOrig       = {};
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


    return {


        /**
         * adds a player to the players object and gives them 10 cards
         *
         * @param {str}             playerName          player name
         *
         * @return {str}                                welcome or error message
         */
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
                    text += '  ***  ' + ( i + 1 ) + ': ' + hand[ i ].text;
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


        cancelQuestion : function( silent )
        {
            activeQuestion.used = false;
            activeQuestion      = false;

            if ( !silent )
            {
                _bot.say( userConfig.cahRoom, '5 min is up!  This question is expired.' );
            }
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
                res[ _arr[ i ] ] = ( res[ _arr[ i ] ] ) ? res[ _arr[ i ] ] + 1 : 1;

                if ( !common || res[ _arr[ i ] ] > res[ common ] )
                {
                    common = _arr[ i ];
                }
            }

            return common;
        },


        /**
         * adds a card to a players hand and marks it as not in the deck
         *
         * @param  {obj}            player              player obj
         *
         * @return {obj}                                drawn card
         */
        drawCard : function( player, cardNum )
        {
            var card        = this.getCard( 'A' );
            if ( cardNum )
            {
                player.hand[ cardNum ] = card;
            }
            else
            {
                player.hand.push( card );
            }

            card.used       = true;

            return card;
        },


        /**
         * reports their current hand to each player
         *
         * @return {void}
         */
        dealCurrentHands : function()
        {
            var text, hand;
            for ( var playerName in players )
            {
                this.dealCurrentHand( players, playerName );
            }
        },


        dealCurrentHand : function( playerName )
        {
            var text, hand;

            if ( players[ playerName ] && players[ playerName ].hand )
            {
                hand = players[ playerName ].hand;

                if ( activeQuestion )
                {
                    text = '--- CURRENT QUESTION --- ' + activeQuestion.text;
                }
                else
                {
                    text = '-------- CURRENT HAND -------- ';
                }

                for ( var i = 0; i < 10; i++ )
                {
                    text += '  ***  ' + ( i + 1 ) + ': ' + hand[ i ].text;
                }
            }
            else
            {
                text = 'one sec... still dealing';
            }

            _bot.say( playerName, text );
        },


        getCard : function( type, tries )
        {
            tries = tries || 0;
            if ( cards.length > tries )
            {
                var card, cardNumber;

                card = cards.splice( 0, 1 )[0];

                if ( card.cardType === type )
                {
                    return card;
                }
                else
                {
                    cards.push( card );
                    return this.getCard( type );
                }
            }
            else
            {
                cards = this.shuffleCards();
                return this.getCard( type );
            }

        },


        /**
         * ini. double checks PMs are enabled
         *
         * @return {void}
         */
        ini : function()
        {
            if ( userConfig.enablePM )
            {
                this.loadCards();
            }
            else
            {
                console.log( 'you must have private messages enabled to run CAH.  unloading module.' );
                delete modules.CAH;
            }
        },


        /**
         * wrapper for listplayers to check whether or not is being called as an
         * admin
         *
         * @param  {str}            _admin              should equal 'admin'
         *
         * @return {str}                                botText
         */
        listPlayers : function( _admin )
        {
            _admin = _admin || null;

            if ( _admin === 'admin' )
            {
                return this.listPlayersAdmin();
            }
            else
            {
                return this.listPlayersPlayer();
            }
        },


        listPlayersPlayer : function()
        {
            var botText = '';

            var action = ( votingRound ) ? 'vote' : 'play';
            var actionNeeded = false;


            if ( votingRound )
            {
                for ( var voter in cardsPlayed )
                {
                    if ( cardsPlayed[ voter ].length === activeQuestion.numAnswers )
                    {
                        actionNeeded = voted.indexOf( voter ) === -1;
                        botText += actionNeeded ? voter + ' still needs to ' + action + '\n' : '';
                    }
                }
            }
            else
            {
                for ( var player in players )
                {
                    actionNeeded = ! players[ player ].played;
                    botText += actionNeeded ? player + ' still needs to ' + action + '\n' : '';
                }
            }

            return botText;
        },


        listPlayersAdmin : function()
        {
            var botText = '';

            for ( var player in players )
            {
                botText += '\n' + player + ' - ';

                if ( votingRound )
                {
                    botText += 'voted: ';
                    botText += voted.indexOf( player ) === -1 ? false : true;
                    console.log( voted[ player ] );
                }
                else
                {
                    botText += 'played: ' + players[ player ].played;
                }
            }

            botText = botText === '' ? 'no one is playing right now' : 'current players:' + botText;

            return botText;
        },


        /**
         * loads the cards json
         *
         * @return {void}
         */
        loadCards : function()
        {
            var url     = 'json/cards.json';

            cardsOrig   = fs.readFileSync( url );

            cards       = this.shuffleCards();
        },


        newQuestion : function()
        {
            var s, botText;

            if ( votingRound )
            {
                this.startVotingRound();
            }
            else
            {
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
                        min = ( userConfig.cahMaxMin - Math.floor( min + 1 ) );
                        s   = ( min === 1 ) ? '' : 's';
                        min =  min + ' minute' + s + ' left.  ';
                    }

                    s   = ( activeQuestion.numAnswers === 1 ) ? '' : 's';
                    min += activeQuestion.numAnswers + ' answer' + s + ' required.';

                    botText = activeQuestion.text + '\n' + min;
                }
                else
                {
                    if ( playerCount >= userConfig.cahMinPlayers )
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
                        botText = 'You need at least ' + userConfig.cahMinPlayers +
                                ' players.  Don\'t worry, I\'ll wait';
                    }
                }
                _bot.say( userConfig.cahRoom, botText );
            }
        },


        playCard : function( playerName, cardNum )
        {
            var player  = players[ playerName ];
            cardNum = parseInt( cardNum );

            if ( player && player.played === false )
            {
                cardNum--;

                if ( playerName[ cardNum ] !== false )
                {
                    var card = this.useCard( playerName, cardNum );

                    if ( card )
                    {
                        cardsPlayed[ playerName ].push( card );

                        if ( cardsPlayed[ playerName ].length === activeQuestion.numAnswers )
                        {
                            player.played = true;
                            cardCount++;
                            for ( var i = 0, lenI = player.hand.length; i < lenI; i++ )
                            {
                                if ( player.hand[ i ] === false )
                                {
                                    player.hand[ i ] = this.drawCard( player, i );
                                }
                            }
                        }

                        if ( cardCount === playerCount )
                        {
                            this.switchToVoting();
                        }
                    }
                    else
                    {
                        _bot.say( userConfig.cahRoom, 'that\'s not a valid number, ' + playerName );
                    }
                }
                else
                {
                    _bot.say( userConfig.cahRoom, playerName + ', you already used that card' );
                }
            }
            else
            {
                _bot.say( userConfig.cahRoom, playerName + ', you\'ve already played.' );
            }
        },


        /**
         * removes a player from the game
         *
         * @param  {str}            playerName          player to remove
         *
         * @return {str}                                confirmation or error text
         */
        removePlayer : function( playerName )
        {
            var player = players[ playerName ];

            if ( player )
            {
                for ( var i = 0; i < player.hand.length; i++ )
                {
                    player.hand[ i ].user = false;
                }

                var votedIndex = voted.indexOf( playerName );
                if ( votedIndex !== -1 )
                {
                    voted[ votedIndex ] = null;
                    voted = voted.filter( function( i ){ return i; } );
                }
                else if ( players[ playerName ] && players[ playerName ].played === true )
                {
                    cardCount--;
                }

                delete players[ playerName ];
                delete cardsPlayed[ playerName ];

                playerCount--;

                if ( playerCount <= userConfig.cahMinPlayers )
                {
                    clearTimeout( questionTimeout );
                    cardCount   = 0;
                    votingRound = false;
                    this.cancelQuestion( true );
                    return 'well...  that\'s everyone!';
                }

                if ( votingRound && voted.length === playerCount )
                {
                    votingRound = false;
                    this.votingResult();
                }
                else if ( !votingRound && cardCount === playerCount )
                {
                    this.switchToVoting();
                }

                return 'ok, ' + playerName + '. You\'re out of the game';
            }
            else
            {
                return 'Fine. You weren\'t playing anyways.';
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
                            botText = false;
                            botText = this.removePlayer( to );
                            break;
                        case 'q':
                        case 'question':
                            botText = false;
                            this.newQuestion();
                            break;
                        case 'players':
                            botText = this.listPlayers();
                            break;
                        case 'cards':
                            botText = false;
                            this.dealCurrentHand( to );
                            break;
                        default:
                            if ( command.match( /(10|[0-9])/ ) && activeQuestion )
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
                else if ( userConfig.admins.indexOf( to ) !== -1 )
                {
                    switch ( command )
                    {
                        case 'players':
                            botText = this.listPlayers( 'admin' );
                    }
                }
            }
            return botText;
        },


        shuffleCards : function()
        {
            var num;
            cards = JSON.parse( cardsOrig );
            newDeck = new Array( cards.length );

            for ( var i = 0, lenI = newDeck.length; i < lenI; i++ )
            {
                num = Math.floor( Math.random() * ( cards.length - 1 ) );
                newDeck[ i ] = cards[ num ];
                cards.splice( num, 1 );
            }

            return newDeck;
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


        /**
         * switches the game mode, variables, and broadcast text to voting
         *
         * @return {void}
         */
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
            player      = players[ player ];
            if ( player.hand[ cardNum ] )
            {
                var card    = player.hand[ cardNum ];

                card.used   = false;
                player.hand[ cardNum ] = false;

                return card;
            }
        },


        vote : function( player, vote )
        {
            vote = parseInt( vote );

            if ( vote < 1 || answers.length - 1 < vote )
            {
                return 'That\'s not a valid choice, ' + player;
            }
            else if ( cardsPlayed[ player ].length !== activeQuestion.numAnswers )
            {
                return 'You joined late! You need to wait for the next round to start, ' + player;
            }
            else if ( voted.indexOf( player ) === -1 )
            {
                var validVoters = [];
                for ( var _player in cardsPlayed )
                {
                    validVoters.push( cardsPlayed[ _player ].length !== 0 );
                }
                validVoters = validVoters.filter( function( i ){ return i; } ).length;

                voted.push( player );
                votes.push( vote );

                if ( voted.length === validVoters )
                {
                    votingRound = false;
                    this.votingResult();
                }
            }
            else
            {
                return 'I think you already voted, ' + player;
            }
        },


        votingResult : function()
        {
            var answer;
            var winner          = this.checkMostCommon( votes );
            var winningAnswer   = cardsPlayed[ answers[ winner ] ];

            var text = activeQuestion.text;
            if ( text.indexOf( '__________' ) !== -1 )
            {
                for ( var i = 0, lenI = winningAnswer.length; i < lenI; i++ )
                {
                    answer  = winningAnswer[ i ].text;
                    console.log( 'grabbed the answer' );
                    text    = text.replace( '__________', answer );
                    console.log( 'replaced' );
                }
            }
            else
            {
                text += '   ' + winningAnswer[ 0 ].text;
            }

            _bot.say( userConfig.cahRoom, text + '\n' + answers[ winner ] + ' (answer ' + winner +
                            ') wins this round.' );

            activeQuestion = false;

            for ( var player in cardsPlayed )
            {
                players[ player ].played    = false;
                cardsPlayed[ player ]       = [];
            }

            answers         = [];
            votes           = [];
            voted           = [];

            this.newQuestion();
            this.dealCurrentHands();
        }
    };
};