
/**
 * this is entirely filled with nonsense.  thats all the docs this needs.
 */
module.exports = function Nico( _bot, apiGet, userData, userConfig )
{
    var nicoFlipped     = false;

    return function( from, to, text, botText )
    {
        var command = text.slice( 1 ).split( ' ' )[ 0 ];

        switch( command )
        {
            case 'tag':
                var newNico = text.split( ' ' )[1];

                if ( newNico[ newNico.length - 1 ] === '!' )
                {
                    newNico = newNico.slice( 0, newNico.length - 1 );

                    if ( userConfig.admins.indexOf( newNico ) !== -1 )
                    {
                        botText = 'Ha! You can\'t tag an admin! They\'re my buddies!';
                    }
                    else if ( userConfig.botName === newNico )
                    {
                        botText = 'You can\'t tag me! I\'m out of your league!';
                    }
                    else
                    {
                        userConfig.nico = newNico;
                        botText = newNico + ' is it!';
                    }
                }
                break;
            case 'flip' + ( userConfig.nico ):
            case 'flipthe' + ( userConfig.nico ):
                botText     = '(╯°Д°）╯︵/(.□ . ) ᵇᵘᵗ ᴵ\'ᵐ ᶰᶦᶜᵒ﹗';
                nicoFlipped = true;
                _bot.say( ( userConfig.nico ) + ', I\'m so sorry! ' + to + ' just flipped you like a little turtle. It\'s not my fault, I swear!! Now you\'re stuck on your back in ' + from + ' ' );
                break;
            case 'putthe' +( userConfig.nico ) + 'back':
                botText     = '(._. ) ノ( ゜-゜ノ)';
                nicoFlipped = false;
                break;
            case 'is' + ( userConfig.nico ) + 'flipped':
                if ( nicoFlipped === true )
                {
                    botText = 'yes';
                }
                else
                {
                    botText = 'no';
                }
                break;
            case 'is' + ( userConfig.nico ) + 'abadman?':
                botText = 'yes.  most definitely';
                break;
            case 'whoisit?':
            case 'whosit?':
                botText = ( userConfig.nico ) + ' is it!';
                break;
        }

        if ( nicoFlipped === true && to === userConfig.nico && command !== 'flip' + ( userConfig.nico ) &&
                command !== 'putthe' + ( userConfig.nico ) + 'back' && command !== 'is' + ( userConfig.nico ) + 'flipped' )
        {
            botText = 'I\'m sorry, ' + ( userConfig.nico ) + '... I can\'t hear you while you\'re flipped';
        }

        return botText;
    };
};