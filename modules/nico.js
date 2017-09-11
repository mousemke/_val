
const Module = require( './Module.js' );

let nicoFlipped = false;


/**
 * this is entirely filled with nonsense.  thats all the docs this needs.
 */
class Nico extends Module
{
    constuctor()
    {
        this.nico = this.userConfig.nico || 'nico';
        // setNico( this.nico ) // timing?
    }


    fipTheNico()
    {
        nicoFlipped = true;

        return '(╯°Д°）╯︵/(.□ . ) ᶰᵒᵒᵒᵒᵒᵒᵒᵒᵒ﹗';
    }


    isNicoABadPerson()
    {
        return 'yes.  most definitely';
    }


    isNicoFlipped()
    {
        return nicoFlipped ? 'yes' : 'no';
    }


    putTheNicoBack()
    {
        nicoFlipped = false;

        return '(._. ) ノ( ゜-゜ノ)';
    }


    /**
     * ## responses
     *
     * @return {Object} responses
     */
    responses()
    {

        const { trigger } = this.userConfig;

        return {
            tag : {
                f           : this.tag,
                desc        : 'Tag all the bad people',
                syntax      : `${trigger}tag <name>!`
            },

            'whoisit?' : {
                f           : this.whosIt,
                desc        : 'show\s who is it',
                syntax      : [
                    `${trigger}whoisit?`
                ]
            },


            'whosit?': {
                f           : this.whosIt,
                desc        : 'show\s who\'s it',
                syntax      : [
                    `${trigger}whosit?`
                ]
            }
        };
    }


    setNico( newNico )
    {
        const nico = this.nico = newNico;
        const { insert } = this.dynamic;

        insert( `flipthe${nico}` );
        insert( `flip${nico}` );
        insert( `putthe${nico}back` );
        insert( `is${nico}flipped` );
        insert( `is${nico}abadperson?` );
    }


    removeNico( nico )
    {
        const { remove } = this.dynamic;

        remove( `flipthe${nico}` );
        remove( `flip${nico}` );
        remove( `putthe${nico}back` );
        remove( `is${nico}flipped` );
        remove( `is${nico}abadperson?` );
    }


    whosIt()
    {
        return `${this.nico} is it!`;
    }


    /**
     * ## tag
     *
     * tags a user
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {Sring} text original text minus command
     *
     * @return {String}
     */
    tag( from, to, text, textArr )
    {
        let newNico = textArr[1];

        if ( newNico && newNico[ newNico.length - 1 ] === '!' )
        {
            newNico = newNico.slice( 0, newNico.length - 1 );

            if ( userConfig.admins.indexOf( newNico ) !== -1 )
            {
                botText = `Ha! You can't tag an admin! They're my buddies!`;
            }
            else if ( _bot.name === newNico )
            {
                botText = `You can't tag me! I'm out of your league!`;
            }
            else
            {
                if ( nicoFlipped )
                {
                    _bot.say( from, `Lemme help you up, ${this.nico}` );
                    nicoFlipped = false;
                }

                removeNico( userConfig.nico );
                setNico( newNico );

                botText = `${newNico} is it!`;
            }
        }
    }


// if ( nicoFlipped === true && to === userConfig.nico && command !== `is${userConfig.nico}flipped` )
// {
//     return `I'm sorry, ${userConfig.nico}... I can't hear you while you're flipped`;
// }
};
