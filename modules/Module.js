

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
        const module = this;

        /**
         * ## insert
         *
         * inserts a dynamic command
         *
         * @param {String} command trigger for the function
         * @param {Object} object response object
         *
         * @return {Void} void
         */
        function insert( command, object )
        {
            if ( !_bot.responses.dynamic[ command ] )
            {
                object.f = object.f.bind( module );
                object.source = module.constructor.name;
                _bot.responses.dynamic[ command ] = object;
            }
            else
            {
                console.error(
                    'Duplicate dynamic response:',
                    command,
                    _bot.responses.dynamic[ command ].source
                );
            }
        }


        /**
         * ## remove
         *
         * removes a dynamic command
         *
         * @param {String} command response to remove
         *
         * @return {Void} void
         */
        function remove( command )
        {
            if ( _bot.responses.dynamic[ command ] )
            {
                delete _bot.responses.dynamic[ command ];
            }
            else
            {
                console.error( 'Tried to remove something that didn\'t exists:', command );
            }
        }


        /**
         * ## insertTimed
         *
         * inserts a dynamic command with time bound removal
         *
         * @param {String} command trigger for the function
         * @param {Object} object response object
         * @param {Number} time ms until removal
         *
         * @return {Void} void
         */
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
