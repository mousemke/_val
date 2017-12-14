
const Module        = require( './Module.js' );

/**
 * this modules contains admin only functions.  they are generally called with
 * a double trigger ( '++', '!!', etc)
 */
class Admin extends Module
{
    /**
     * ## checkChannel
     *
     * return the actual current channel id
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text message text
     * @param {Array} textArr text broken into an array of words
     * @param {String} command text that triggered the bot
     * @param {Object} confObj configuration object
     *
     * @return {String} chnnel id
     */
    checkChannel( from, to, text, textArr, command, confObj )
    {
        return confObj.from;
    }


    /**
     * ## constructor
     *
     * sets the initial "global" variables
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

        this.version        = this.version.bind( this );
    }


    /**
     * ## responses
     *
     * admin responses.  they are generally called with
     * a double trigger ( '++', '!!', etc)
     *
     * @return {Object} responses
     */
    responses()
    {
        const { userConfig }    = this;
        const { trigger }       = userConfig;

        const res = {
            commands : {
                [ `${trigger}channel` ] : {
                    f       : this.checkChannel,
                    desc    : 'returns the current channel\'s identifier',
                    syntax      : [
                        `${trigger}${trigger}channel`
                    ]
                },


                [ `${trigger}v` ] : {
                    f       : this.version,
                    desc    : 'returns the current running version number',
                    syntax      : [
                        `${trigger}${trigger}v`
                    ]
                }
            }
        };

        return res;
    }


    /**
     * ## version
     *
     * returns the version number of val currently running
     *
     * @param {String} from channel message originated from
     * @param {String} to person who sent the message
     *
     * @return {String} version text
     */
    version( from, to )
    {
        const { userConfig } = this;

        if ( userConfig.admins.indexOf( to.toLowerCase() ) !== -1 )
        {
            return `Well, ${to}, thanks for asking!  I'm currently running version ${userConfig.version}`;
        }
    }
};

module.exports  = Admin;
