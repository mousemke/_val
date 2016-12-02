

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
        this._bot           = _bot;
        this._modules       = _modules;
        this.userConfig     = userConfig;
        this.commandModule  = commandModule;
    }

    /**
     * responses
     */
    responses()
    {
        return {};
    };
};

module.exports  = Module;
