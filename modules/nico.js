
const Module = require( './Module.js' );


/**
 * this is entirely filled with nonsense.  thats all the docs this needs.
 */
class Nico extends Module
{
    /**
     * ## constructor
     *
     * sets the initial state
     *
     * @param {Object} _bot instance of _Val with a core attached
     * @param {Object} _modules config and instance of all modules
     * @param {Object} userConfig available options
     * @param {Object} commandModule instance of the applied core
     *
     * @return {Void} void
     */
    constructor( _bot, _modules, userConfig, commandModule )
    {
        super( _bot, _modules, userConfig, commandModule );

        userConfig.nico = userConfig.nico || 'nico';

        userConfig.nicoFlipped = false;

        this.setNico( userConfig.nico );
    }


    /**
     * ## fipTheNico
     *
     * flip that nico!
     *
     * @return {String} flipped!
     */
    fipTheNico()
    {
        this.userConfig.nicoFlipped = true;

        return '(╯°Д°）╯︵/(.□ . ) ᶰᵒᵒᵒᵒᵒᵒᵒᵒᵒ﹗';
    }


    /**
     * ## isNicoABadPerson
     *
     * the nico is a bad person
     *
     * @return {String} ofc
     */
    isNicoABadPerson()
    {
        return 'yes.  most definitely';
    }


    /**
     * ## isNicoFlipped
     *
     * is nico flipped or not.  also the only command a flipped nico can use
     *
     * @return {String} yes or no
     */
    isNicoFlipped()
    {
        return this.userConfig.nicoFlipped ? 'yes' : 'no';
    }


    /**
     * ## putTheNicoBack
     *
     * takes pity on the nico
     *
     * @return {String} careful!
     */
    putTheNicoBack()
    {
        this.userConfig.nicoFlipped = false;

        return '(._. ) ノ( ゜-゜ノ)';
    }


    /**
     * ## removeNico
     *
     * removes all the dynamic commands
     */
    removeNico( nico )
    {
        const { remove } = this.dynamic;

        remove( `flipthe${nico}` );
        remove( `flip${nico}` );
        remove( `putthe${nico}back` );
        remove( `is${nico}flipped?` );
        remove( `is${nico}abadperson?` );
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
            commands : {
                tag : {
                    f           : this.tag,
                    desc        : 'Tag all the bad people',
                    syntax      : [
                        `${trigger}tag <name>!`
                    ]
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
            }
        };
    }


    /**
     * ## setNico
     *
     * sets all the dynamic commands
     */
    setNico( newNico )
    {
        const { trigger } = this.userConfig;

        const nico = this.userConfig.nico = newNico;
        const { insert } = this.dynamic;

        insert( `flipthe${nico}`, {
            f           : this.fipTheNico,
            desc        : `show the ${nico} who\'s boss`,
            syntax      : [
                `${trigger}flipthe${nico}`
            ]
        } );

        insert( `flip${nico}`, {
            f           : this.fipTheNico,
            desc        : `show the ${nico} who\'s boss`,
            syntax      : [
                `${trigger}flip${nico}`
            ]
        } );

        insert( `putthe${nico}back`, {
            f           : this.putTheNicoBack,
            desc        : `have pity on the poor ${nico}`,
            syntax      : [
                `${trigger}putthe${nico}back`
            ]
        } );

        insert( `is${nico}flipped?`, {
            f           : this.isNicoFlipped,
            desc        : `report the ${nico} status`,
            syntax      : [
                `${trigger}is${nico}flipped?`
            ]
        } );

        insert( `is${nico}abadperson?`, {
            f           : this.isNicoABadPerson,
            desc        : 'an obvious question',
            syntax      : [
                `${trigger}is${nico}abadperson?`
            ]
        } );

    }


    /**
     * ## tag
     *
     * tags a user
     *
     * @param {String} to originating user
     * @param {String} text message text
     * @param {Array} textArr text broken into an array of words
     * @param {String} command text that triggered the bot
     * @param {Object} confObj configuration object
     *
     * @return {String}
     */
    tag( from, to, text, textArr, command, confObj )
    {
        const {
            admins,
            nicoFlipped,
            nico
        } = this.userConfig;

        let newNico = textArr[0];

        if ( newNico && newNico[ newNico.length - 1 ] === '!' )
        {
            newNico = newNico.slice( 0, newNico.length - 1 );

            if ( admins.indexOf( newNico ) !== -1 )
            {
                return `Ha! You can't tag an admin! They're my buddies!`;
            }
            else if ( this._bot.name === newNico )
            {
                return `You can't tag me! I'm out of your league!`;
            }
            else
            {
                if ( nicoFlipped )
                {
                    this._bot.say( from, `Lemme help you up, ${nico}`, confObj );
                    this.userConfig.nicoFlipped = false;
                }

                this.removeNico( nico );
                this.setNico( newNico );

                return `${newNico} is it!`;
            }
        }
    }


    /**
     * ## whosIt
     *
     * tells the people who the nico is
     *
     * @return {String}
     */
    whosIt()
    {
        return `${this.userConfig.nico} is it!`;
    }
};

module.exports = Nico;
