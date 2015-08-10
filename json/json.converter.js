/**
 * converter for http://www.crhallberg.com/cah/json into the correct format
 */
var card, cah = [], name, cardNum, _black = a.blackCards.length;

for ( var i = 0, lenI = a.blackCards.length; i < lenI; i++ )
{
    card = a.blackCards[ i ];

    cah[ i ] = {
      id            : i + 1,
      cardType      : 'Q',
      text          : card.text,
      numAnswers    : card.pick,
      used          : false,
      expansion     : 'none'
    };
}

for ( var j = 0, lenJ = a.whiteCards.length; j < lenJ; j++ )
{
    card    = a.whiteCards[ j ];
    cardNum = j + _black;

    cah[ cardNum ] = {
      id            : cardNum + 1,
      cardType      : 'A',
      text          : card,
      numAnswers    : 0,
      used          : false,
      expansion     : 'none'
    };
}

for ( var set in a )
{
    if ( set !== 'blackCards' && set !== 'whiteCards' )
    {
        name = a[ set ].name;

        for ( var i = 0, lenI = a[ set ].black.length; i < lenI; i++ )
        {
            cardNum = a[ set ].black[ i ];
            cah[ cardNum ].expansion = name;
        }

        for ( var j = 0, lenJ = a[ set ].white.length; j < lenJ; j++ )
        {
            cardNum = a[ set ].white[ j ];
            cah[ cardNum ].expansion = name;
        }
    }
}

