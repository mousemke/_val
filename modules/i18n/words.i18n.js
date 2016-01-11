module.exports = {
    newWord         : {
        de : 'Der neue Anagramm ist: ',
        en : 'The new scramble word is: '
    },
    currentWord     : {
        de : 'Das Anagramm ist: ',
        en : 'The current scramble word is: '
    },
    scoreHeader     : {
        de : 'Anagramm Punktzahl - \n',
        en : 'Unscramble Scores - \n'
    },
    youHavePoints   : {
        de : function( to, playerPoints )
                { return 'Hallo ' + to + '! Du hast ' + playerPoints + ' Punkte' },
        en : function( to, playerPoints )
                { return 'Hey ' + to + '! You have ' + playerPoints + ' point' }
    },
    theyHavePoints  : {
        de : function( to, playerRequest, playerPoints )
                { return 'Moin ' + to + '! ' + playerRequest + ' hat ' + playerPoints + ' Punkte' },
        en : function( to, playerRequest, playerPoints )
                { return 'Why hello ' + to + '! ' + playerRequest + ' has ' + playerPoints + ' point' }
    },
    nonplayer       : {
        de : function( to, playerRequest )
                { return 'Hmm... ' + to + '... Ich glaube nicht, dass ' + playerRequest + ' ist eine reale Person' },
        en : function( to, playerRequest )
                { return 'Well... ' + to + '... I don\'t think ' + playerRequest + ' is a real person' }
    },
    plural          : {
        de : 'n',
        en : 's'
    },
    isNotAWord      : {
        de : ' ist keine Wort.',
        en : ' is, sadly, not a word.'
    },
    forgot          : {
        de : 'ummm....    Keine Ahnung',
        en : 'ummm....    I forgot'
    },
    point           : {
        de : ' Punkte',
        en : ' point'
    },
    additionalDefs  : {
        de : function( to, additionalDefs )
                { return '\n (' + to + ' schlagen sie -def für ' + additionalDefs + ' weitere Definitionen)' },
        en : function( to, additionalDefs )
                { return '\n (' + to + ' hit -def for ' + additionalDefs + ' more definitions)' }
    },
    seconds         : {
        de : ' Sekunden!',
        en : ' seconds!'
    },
    youveEarned     : {
        de : ' Du kriegst Ð',
        en : ' You\'ve earned Ð'
    },
    voteCounted     : {
        de : function( newWordVote )
                { return ': festgestellt. Das ist ' + newWordVote.length + ' von ' },
        en : function( newWordVote )
                { return ': counted. that\'s ' + newWordVote.length + ' out of a necessary ' }
    },
    wordVotedOut    : {
        de : 'Das ist genug. Der Antwort war:\n',
        en : 'that\'s enough votes. The correct answer was:\n'
    },
    wordRes      : {
        de : 'wort',
        en : 'word'
    },
    newWordRes  : {
        de : 'neuesWort',
        en : 'newWord'
    }
};


