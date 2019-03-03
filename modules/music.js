module.exports = function Music(_bot, _modules, userConfig, commandModule) {
  var fs = userConfig.req.fs;
  var musicRooms = userConfig.musicRooms;

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
     * @return {String} changed botText
     */
    responses: function(from, to, text, botText, command, confObj) {
      console.log(musicRooms, from, musicRooms.indexOf(from));
      if (
        musicRooms.indexOf(from) !== -1 ||
        musicRooms === '*' ||
        musicRooms[0] === '*'
      ) {
        let spotify = text.indexOf('https://open.spotify.com/') !== -1;
        let youtube = text.indexOf('https://www.youtube.com/') !== -1;
        let apple = text.indexOf(' https://itun.es/') !== -1;

        if (spotify) {
          let r = /https:\/\/open\.spotify\.com\/album\/([A-Za-z-]+)/g;
          let id = r.exec(text);

          if (id) {
            return `spotify id - ${id[1]}`;
          }
        } else if (apple) {
          let r = /https:\/\/itun\.es\/[a-z]{2}\/([A-Za-z-]+)/g;
          let id = r.exec(text);

          if (id) {
            return `apple music id - ${id[1]}`;
          }
        } else if (youtube) {
          let r = /https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z-]+)/g;
          let id = r.exec(text);

          if (id) {
            return `youtube video id - ${id[1]}`;
          }
        } else {
          // switch ( command )
          // {
          //     case 'players':
          //         botText = this.listPlayers();
          //         break;
          // }
        }
      }

      return botText;
    },
  };
};
