

class Module
{
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
        function insert( command, object )
        {
            if ( !this._bot.responses.dynamic[ command ] )
            {
                this._bot.responses.dynamic[ command ] = object;
            }
            else
            {
                console.error( 'Duplicate dynamic response', command );
            }
        }


        function remove( command )
        {
            if ( this._bot.responses.dynamic[ command ] )
            {
                this._bot.responses.dynamic[ command ] = null;
            }
        }


        function insertTimed( command, object, time )
        {
            insert( command, object );

            setTimeout( () => remove( command ), time );
        }


        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
        this.dynamic        = {
            insert : insert,
            remove : remove,
            insertTimed : insertTimed
        };
    }

    /**
     * responses
     */
    responses()
    {
        return {
            commands    : {},

            regex       : {}
        };
    };
};

module.exports  = Module;
