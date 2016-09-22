
module.exports  = function Music( _bot, _modules, userConfig )
{
    var fs          = userConfig.req.fs;
    var musicRooms  = userConfig.musicRooms;

// apple music example search
// https://itunes.apple.com/search?country=de&entity=musicArtist&limit=5&term=crystal+castles&songTerm=untrust+us

// spotify web api
// https://developer.spotify.com/web-api/tutorial/


// youtube id search
// https://www.googleapis.com/youtube/v3/videos?part=snippet&id=RjUlmco7v2M&key=ytApiKey
//
    return {


        /**
         * ## responses
         *
         * possible responses to commands
         *
         * @param {String} from originating channel
         * @param {String} to originating user
         * @param {String} text full input string
         * @param {String} botText text to say
         * @param {String} command bot command (first word)
         * @param {Object} confObj extra config object that some command modules need
         *
         * @return _String_ changed botText
         */
        responses : function( from, to, text, botText, command, confObj )
        {
            if ( musicRooms.indexOf( from ) !== -1 || musicRooms === '*' || 
                    musicRooms[ 0 ] === '*' )
            {

                if ( /* check for music links */ )
                {
                    // return this.roll( from, to, text, roll )
                }
                else
                {
                    // switch ( command )
                    // {
                    //     case 'players':
                    //         botText = this.listPlayers();
                    //         break;
                    // }
                }
            }

            return botText;
        }
    };
};
