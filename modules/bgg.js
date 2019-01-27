// doc https://boardgamegeek.com/wiki/page/BGG_XML_API

const Module        = require( './Module.js' );

const xmlJs = require('xml-js');
const dumpWeirdChars = /[^:a-zA-z0-9 -\/]/g;
const xml2js = (xml) => JSON.parse(xmlJs.xml2json(xml, {compact: true}));

class Bgg extends Module
{
    /**
     * ## bgg
     *
     * performs a basic api name search
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {Sring} text original text minus command
     * @param {Sring} textArr text minus command split into an array by ' '
     *
     * @return {String} card image url
     */
    bgg( from, to, text, textArr )
    {
        return new Promise((resolve, reject) => {
            const {
                bggApiBaseUrl,
                req
            } = this.userConfig;

            const request   = req.request;

            const cleanText = text.replace( dumpWeirdChars, '' ).replace(/ /g, '%20');

            const options   = {
                method  : 'GET',
                url     : `${bggApiBaseUrl}search?search=${cleanText}&exact=1`,
            };

            const callback = ( error, response, body ) =>
            {
                if (body && !error)
                {
                    let boardGame = xml2js(body).boardgames.boardgame;
                    let multipleHits = false;

                    if ( !boardGame)
                    {
                        resolve(`Sorry ${to}, I didn't find anything. Maybe try a site search.\nwww.boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${cleanText}&B1=Go`);

                        return null;
                    }
                    else if (Array.isArray(boardGame)) {
                        boardGame = boardGame.sort((a, b) => parseInt(a.yearpublished._text) < parseInt(b.yearpublished._text))[0];
                        multipleHits = true;
                    }

                    const id = boardGame._attributes.objectid;

                    const gameOptions = {
                        method  : 'GET',
                        url     : `${bggApiBaseUrl}/boardgame/${id}`,
                    };

                    const gameCb = ( error, response, body ) =>
                    {
                        const boardGame = xml2js(body).boardgames.boardgame;

                        if ( boardGame.error)
                        {
                            resolve(`Sorry ${to}, I didn't find anything. Maybe try a site search.\nwww.boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${cleanText}&B1=Go`);

                            return null;
                        }

                        const {
                            maxplayers: { _text: maxPlayers },
                            maxplaytime: { _text: maxPlayTime },
                            minplayers: { _text: minPlayers },
                            minplaytime: { _text: minPlayTime },
                            name: namesRaw,
                            playingtime: { _text: playingTime },
                            thumbnail: { _text: thumbnail },
                            yearpublished: { _text: yearPublished },
                            boardgamemechanic: mechanicRaw,
                            boardgamecategory: categoryRaw,
                            boardgamefamily: familyRaw,
                            poll: pollsRaw,
                        } = boardGame;

                        const namesArray = Array.isArray(namesRaw) ? namesRaw : [namesRaw];
                        const mechanicArray = Array.isArray(mechanicRaw) ? mechanicRaw : [mechanicRaw];
                        const categoryArray = Array.isArray(categoryRaw) ? categoryRaw : [categoryRaw];
                        const pollsArray = Array.isArray(pollsRaw) ? pollsRaw : [pollsRaw];
                        const familyArray = Array.isArray(familyRaw) ? familyRaw : [familyRaw];

                        const name = namesArray.filter(n => n._attributes.primary === 'true')[0]._text;
                        const categories = categoryArray.map(cat => cat._text).join(', ');
                        const mechanics = mechanicArray.map(mech => mech._text).join(', ');
                        const family = familyArray.map(fam => fam._text).join(', ');
                        const languageDependence = pollsArray
                            .filter(poll => poll._attributes.name === 'language_dependence')[0]
                            .results
                            .result
                            .sort((a, b) => parseInt(a._attributes.numvotes) < parseInt(b._attributes.numvotes))[0]
                            ._attributes;

                        let gameResult = `${thumbnail}\n` +
                            `*${name}* (${yearPublished})\n\n` +
                            (minPlayers === maxPlayers ? minPlayers : `${minPlayers} - ${maxPlayers}`) + ' players\n';

                        if (playingTime === minPlayTime && playingTime === maxPlayTime) {
                            gameResult += `${playingTime} min`;
                        }
                        else if (minPlayTime === maxPlayTime) {
                            gameResult += `${playingTime} min (${minPlayTime} min)`;
                        }
                        else {
                            gameResult += `${playingTime} min (${minPlayTime}-${maxPlayTime} min)`;
                        }

                        gameResult += `\n\n*Family*: ${family}\n\n*Categories*: ${categories}\n\n*Mechanics*: ${mechanics}\n\n`;

                        const {
                            level: ldLevel,
                            value: ldValue,
                        } = languageDependence;

                        gameResult += `*Language Dependence*: ${ldLevel} ${ldValue}\n\nwww.boardgamegeek.com/boardgame/${id}`;

                        if (multipleHits) {
                            gameResult += `\n\n\n------------\n\n*Multiple results* Above is the newest game. You can see the other results with a full search.\n\nwww.boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${cleanText}&B1=Go`
                        }

                        resolve(gameResult);

                    };

                    request(gameOptions, gameCb);
                }
                else
                {
                    resolve('sorry.... something went wrong. maybe try again later or mention this to an admin');
                }
            }

            request(options, callback);
        });
    }


    /**
     * bgg responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            commands : {
                bgg : {
                    f       : this.bgg,
                    desc    : 'searches board game geek for a game by name',
                    syntax      : [
                        `${trigger}bgg <query>`
                    ]
                },
            }
        };
    }
};


module.exports = Bgg;
