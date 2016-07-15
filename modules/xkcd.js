
module.exports  = function XKCD( _bot, _modules, userConfig )
{
    return {

        getComic : function( from, to, text, botText )
        {
            return new Promise( function( resolve, reject )
            {
                _modules.core.apiGet( userConfig.xkcdAppUrl, function( response )
                {
                    resolve( response.url + '\n' + response.title );
                }, false, from, to );
            } );
        },


        /**
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command )
        {
            switch ( command )
            {
                case 'xkcd':
                    return this.getComic( from, to, text );
            }

            return botText;
        }
    };
};
