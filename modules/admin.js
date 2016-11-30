
/**
 * this modules contains admin only functions.  they are generally called with
 * a double trigger ( '++', '!!', etc)
 */
class Admin
{
    constructor( _bot, _modules, userConfig, commandModule )
    {
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;

        this.version        = this.version.bind( this );
    }


    /**
     * ## responses
     *
     * admin responses.  they are generally called with
    * a double trigger ( '++', '!!', etc)
     *
     * @return _String_ changed botText
     */
    responses()
    {
        const { userConfig }     = this;
        const { trigger }       = userConfig;
        const res = {};

        res[ `${trigger}v` ] = {
            f       : this.version,
            desc    : 'returns the current running version number',
            syntax      : [
                `${trigger}${trigger}v`
            ]
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
