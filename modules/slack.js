
module.exports = function Slack( _bot, _modules, userConfig )
{
    return {

        responses : function( from, to, text, botText )
        {
            return botText;
        }
    };
};
