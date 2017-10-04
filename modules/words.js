
const copy              = require( './i18n/words.i18n.js' );
const http              = require( 'http' );
const https             = require( 'https' );
const fs                = require( 'fs' );
const Module            = require( './Module.js' );

const complexTranslation = /[a-z]{2}\|[a-z]{2}/;

let lang;
let wordsChannel;
let dogePayout;
let dogeModifier;
let pointTimeout;


class Words extends Module
{
    /**
     * ## constructor
     *
     * reads word object and gets an initial word
     *
     * @param {Object} _bot instance of _Val with a core attached
     * @param {Object} _modules config and instance of all modules
     * @param {Object} userConfig available options
     * @param {Object} commandModule instance of the applied core
     *
     * @return {Void} void
     */
    constructor( _bot, _modules, userConfig, commandModule, activeWord )
    {
        super( _bot, _modules, userConfig, commandModule, activeWord );

        activeWord = this.activeWord = activeWord || {
            currentWord     : '',
            currentWordTime : 0,
            currentWordDef  : '',
            define          : true,
            englishWord     : '',
            minLength       : 4,
            maxLength       : 8,
            newWordVote     : [],
            scrambledWord   : '',
            wordScores      : {},
            wordListener    : undefined,
            verboseDef      : false,
            lang            : userConfig.wordsLang,
            channel         : userConfig.wordsChannel,
            dogePayout      : userConfig.wordsDogePayout,
            dogeModifier    : userConfig.wordsDogeModifier,
            pointTimeout    : userConfig.wordsPointTimeout
        };

        lang            = activeWord.lang;
        wordsChannel    = activeWord.channel;
        dogePayout      = activeWord.dogePayout;
        dogeModifier    = activeWord.dogeModifier;
        pointTimeout    = activeWord.pointTimeout;

        setTimeout( this.word, 300000 );
    }


    /**
     * ## complexTranslation
     *
     * translates between 2 languages
     *
     * @param {String} to originating user
     * @param {String} text message text
     * @param {Array} textArr text broken into an array of words
     *
     * @return {String} changed botText
     */
    complexTranslation( from, to, text, botText, command )
    {
        if ( this.activeWord.define )
        {
            command = command.split( '|' );
            return this.translate( command[0], command[1], from, to, text );
        }

        return '';
    }


    /**
     * ## define
     *
     * grabs the definition of a word anf prints it
     *
     * @param {String} from originating channel
     * @param {String} word word to define
     * @param {Boolean} current current word or not
     * @param {String} to originating user
     *
     * @return {Void}
     */
    define( from, word, current, to )
    {
        const { userConfig } = this;

        return new Promise( ( resolve, reject ) =>
        {
            word    = word.toLowerCase();
            const url = `${userConfig.wordnikBaseUrl}word.json/${word}/definitions?includeRelated=true&useCanonical=true&includeTags=false&api_key=${userConfig.wordnikAPIKey}`;

            this._modules.core.apiGet( url, result =>
            {
                if ( current === true )
                {
                    this.activeWord.currentWordDef = result;
                }
                else
                {
                    while ( word.indexOf( '%20' ) !== -1 )
                    {
                        word = word.replace( '%20', ' ' );
                    }

                    let _def = word;

                    if ( result.length === 0 )
                    {
                        _def += copy.isNotAWord[ lang ];
                    }
                    else
                    {
                        _def += ' -\n';

                        for ( let i = 0, lenI = result.length; i < lenI; i++ )
                        {
                            _def += `${i + 1}: ${result[ i ].text}\n`;
                        }
                    }

                    resolve( _def );
                }

            }, false, from, to );
        } );
    }


    /**
     * ## defineCommand
     *
     * called by responses, this gets a definition from the api
     *
     * @param {String} to originating user
     * @param {String} text message text
     * @param {Array} textArr text broken into an array of words
     *
     * @return {String}
     */
    defineCommand( from, to, text, textArr )
    {
        if ( this.activeWord.define )
        {
            return this.define( from, textArr.join( '%20' ), false, to );
        }
    }


    /**
     * ## listenToWord
     *
     * listens to a word and reacts if someone needs a definition or
     * matches a word
     *
     * @param {String} word user input
     * @param {String} to originating user
     * @param {String} text full input string
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {Void}
     */
    listenToWord( word, to, text, confObj )
    {
console.log( 'disabled for now' );
        // const { activeWord } = this;

        // if ( activeWord.verboseDef !== false && activeWord.verboseDef[0] === to && text === '-def' )
        // {
        //     this.showVerboseDef( confObj );
        // }
        // else if ( text.toLowerCase() === word.toLowerCase() )
        // {
        //     var points, now = Date.now();

        //     if ( activeWord.wordScores[ to ] )
        //     {
        //         for ( var i = 0, lenI = activeWord.wordScores[ to ].length; i < lenI; i++ )
        //         {
        //             if ( activeWord.wordScores[ to ][ i ] < now - pointTimeout )
        //             {
        //                 activeWord.wordScores[ to ].splice( i, 1 );
        //             }
        //         }

        //         activeWord.wordScores[ to ].push( now );
        //     }
        //     else
        //     {
        //         activeWord.wordScores[ to ] = [ now ];
        //     }

        //     points = activeWord.wordScores[ to ].length;

        //     var solveTime   = Math.floor( ( now - activeWord.currentWordTime ) / 10 ) / 100;
        //     var botText     = `WOW ${to}! Such ${points}${copy.point[ lang ]}`;
        //     if ( points !== 1 )
        //     {
        //         botText += copy.plural[ lang ];
        //     }
        //     botText += `! Many ${solveTime}${copy.seconds[ lang ]}`;

        //     if ( _modules.Doge && dogePayout )
        //     {
        //         var dogetip = activeWord.currentWord.length * dogeModifier;

        //         _modules.Doge.giveFromBank( to, dogetip, true );
        //         botText += `${copy.youveEarned[ lang ]}${dogetip}!`;
        //     }

        //     var additionalDefs = activeWord.currentWordDef.length - 1;

        //     if ( ! activeWord.currentWordDef || ! activeWord.currentWordDef[0] )
        //     {
        //         activeWord.currentWordDef = [ { text: copy.forgot[ lang ] } ];
        //     }

        //     botText += '\n' + activeWord.currentWord + ': ';

        //     botText += activeWord.englishWord && activeWord.currentWord !== activeWord.englishWord ?  activeWord.englishWord + ': ' : '';
        //     botText += activeWord.currentWordDef[0].text;

        //     if ( additionalDefs !== 0 )
        //     {
        //         botText     += copy.additionalDefs[ lang ]( to, additionalDefs );
        //         activeWord.verboseDef  = [ to, activeWord.currentWord, activeWord.currentWordDef ];
        //     }
        //     else
        //     {
        //         activeWord.verboseDef      = false;
        //     }

        //     _bot.say( wordsChannel, botText, confObj );

        //     activeWord.currentWord     = '';
        //     activeWord.currentWordDef  = '';
        //     activeWord.currentWordTime = '';
        //     activeWord.newWordVote     = [];

        //     _bot.removeListener( 'message' + wordsChannel, activeWord.wordListener );

        //     this.word();
        // }
    }


    /**
     * ## newWord
     *
     * registers votes, then starts the new word process when necessary
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {Void}
     */
    newWord( from, to, confObj )
    {
console.log( 'disabled for now' );
        // var active = this._modules.core.checkActive( from, to, '', false );

        // if ( activeWord.newWordVote.indexOf( to ) === -1 )
        // {
        //     activeWord.newWordVote.push( to );
        // }

        // var votesNeeded = active.length * userConfig.newWordVoteNeeded;

        // if ( activeWord.newWordVote.length < votesNeeded )
        // {
        //     return to + copy.voteCounted[ lang ]( activeWord.newWordVote ) + votesNeeded;
        // }
        // else
        // {
        //     if ( activeWord.currentWord !== '' )
        //     {
        //         var _whatTheBotSay = copy.wordVotedOut[ lang ] + activeWord.currentWord + ': ';
        //         _whatTheBotSay += activeWord.englishWord && activeWord.currentWord !== activeWord.englishWord ?  activeWord.englishWord + ': ' : '';
        //         _whatTheBotSay += activeWord.currentWordDef[0].text;

        //         _bot.say( wordsChannel, _whatTheBotSay, confObj );

        //         activeWord.currentWord     = '';
        //     }

        //     activeWord.currentWordTime = 0;
        //     activeWord.scrambledWord   = '';
        //     activeWord.newWordVote     = [];

        //     if ( activeWord.wordListener )
        //     {
        //         _bot.removeListener( 'message' + wordsChannel, activeWord.wordListener );
        //     }

        //     return this.word();
        // }
    }


    /**
     * ## processNewWord
     *
     * processes a new word grabbed from the api and does anything needed
     * to make it ready
     *
     * @param {Object} result word with all related properties
     * @param {String} to originating user
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {Void}
     */
    processNewWord( result, to, confObj )
    {
console.log( 'disabled for now' );
        // activeWord.currentWord         = result.word;
        // var currentWordLength = activeWord.currentWord.length;

        // if ( activeWord.currentWord[ currentWordLength - 1 ] === '.' )
        // {
        //     activeWord.currentWord.slice( currentWordLength - 1 );
        // }

        // activeWord.currentWordTime = Date.now();

        // this.define( wordsChannel, activeWord.currentWord, true, to );
        // activeWord.scrambledWord   = this.scramble( activeWord.currentWord );

        // activeWord.wordListener    = this.listenToWord.bind( this, activeWord.currentWord );
        // _bot.addListener( 'message' + wordsChannel, activeWord.wordListener );

        // return `${copy.newWord[ lang ]}${activeWord.scrambledWord} (${activeWord.currentWord[0]})`;
    }


    /**
     * ## responses
     *
     * @return {Object} responses
     */
    responses()
    {
        const { trigger } = this.userConfig;

        return {
            commands : {
                def : {
                    f           : this.defineCommand,
                    desc        : 'Define a word',
                    syntax      : [
                        `${trigger}def <word>`
                    ]
                },

                define : {
                    f           : this.defineCommand,
                    desc        : 'Define a word',
                    syntax      : [
                        `${trigger}define <word>`
                    ]
                },

                aa : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Afar to English',
                    syntax  : [
                        `${trigger}aa <word>`
                    ]
                },

                af : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Afrikaans to English',
                    syntax  : [
                        `${trigger}af <word>`
                    ]
                },

                an : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from an to English',
                    syntax  : [
                        `${trigger}an <word>`
                    ]
                },

                ay : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Aymara to English',
                    syntax  : [
                        `${trigger}ay <word>`
                    ]
                },

                ar : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Arabic to English',
                    syntax  : [
                        `${trigger}ar <word>`
                    ]
                },

                bs : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from bs to English',
                    syntax  : [
                        `${trigger}bs <word>`
                    ]
                },

                ca : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Catalan to English',
                    syntax  : [
                        `${trigger}ca <word>`
                    ]
                },

                ce : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from ce to English',
                    syntax  : [
                        `${trigger}ce <word>`
                    ]
                },

                ch : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from ch to English',
                    syntax  : [
                        `${trigger}ch <word>`
                    ]
                },

                co : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Corsican to English',
                    syntax  : [
                        `${trigger}co <word>`
                    ]
                },

                cs : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Czech to English',
                    syntax  : [
                        `${trigger}cs <word>`
                    ]
                },

                da : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from da to English',
                    syntax  : [
                        `${trigger}da <word>`
                    ]
                },

                de : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from German to English',
                    syntax  : [
                        `${trigger}de <word>`
                    ]
                },

                dv : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from dv to English',
                    syntax  : [
                        `${trigger}dv <word>`
                    ]
                },

                el : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Greek to English',
                    syntax  : [
                        `${trigger}el <word>`
                    ]
                },

                eo : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Esperanto to English',
                    syntax  : [
                        `${trigger}eo <word>`
                    ]
                },

                es : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Spanish to English',
                    syntax  : [
                        `${trigger}es <word>`
                    ]
                },

                et : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Estonian to English',
                    syntax  : [
                        `${trigger}et <word>`
                    ]
                },

                eu : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Basque to English',
                    syntax  : [
                        `${trigger}eu <word>`
                    ]
                },

                fi : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Finnish to English',
                    syntax  : [
                        `${trigger}fi <word>`
                    ]
                },

                fj : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Fiji to English',
                    syntax  : [
                        `${trigger}fj <word>`
                    ]
                },

                fo : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Faeroese to English',
                    syntax  : [
                        `${trigger}fo <word>`
                    ]
                },

                fr : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from French to English',
                    syntax  : [
                        `${trigger}fr <word>`
                    ]
                },

                gl : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Galician to English',
                    syntax  : [
                        `${trigger}gl <word>`
                    ]
                },

                he : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from he to English',
                    syntax  : [
                        `${trigger}he <word>`
                    ]
                },

                ho : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from ho to English',
                    syntax  : [
                        `${trigger}ho <word>`
                    ]
                },

                hr : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Croatian to English',
                    syntax  : [
                        `${trigger}hr <word>`
                    ]
                },

                hy : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Armenian to English',
                    syntax  : [
                        `${trigger}hy <word>`
                    ]
                },

                id : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from id to English',
                    syntax  : [
                        `${trigger}id <word>`
                    ]
                },

                it : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Italian to English',
                    syntax  : [
                        `${trigger}it <word>`
                    ]
                },

                is : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Icelandic to English',
                    syntax  : [
                        `${trigger}is <word>`
                    ]
                },

                ja : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Japanese to English',
                    syntax  : [
                        `${trigger}ja <word>`
                    ]
                },

                jv : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Javanese to English',
                    syntax  : [
                        `${trigger}jv <word>`
                    ]
                },

                ky : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Kirghiz to English',
                    syntax  : [
                        `${trigger}ky <word>`
                    ]
                },

                km : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Cambodian to English',
                    syntax  : [
                        `${trigger}km <word>`
                    ]
                },

                ko : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Korean to English',
                    syntax  : [
                        `${trigger}ko <word>`
                    ]
                },

                la : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Latin to English',
                    syntax  : [
                        `${trigger}la <word>`
                    ]
                },

                lo : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Laothian to English',
                    syntax  : [
                        `${trigger}lo <word>`
                    ]
                },

                lt : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Lithuanian to English',
                    syntax  : [
                        `${trigger}lt <word>`
                    ]
                },

                lv : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Latvian to English',
                    syntax  : [
                        `${trigger}lv <word>`
                    ]
                },

                mg : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Malagasy to English',
                    syntax  : [
                        `${trigger}mg <word>`
                    ]
                },

                mo : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Moldavian to English',
                    syntax  : [
                        `${trigger}mo <word>`
                    ]
                },

                ms : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Malay to English',
                    syntax  : [
                        `${trigger}ms <word>`
                    ]
                },

                ne : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Nepali to English',
                    syntax  : [
                        `${trigger}ne <word>`
                    ]
                },

                nl : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Dutch to English',
                    syntax  : [
                        `${trigger}nl <word>`
                    ]
                },

                no : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Norwegian to English',
                    syntax  : [
                        `${trigger}no <word>`
                    ]
                },

                os : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from os to English',
                    syntax  : [
                        `${trigger}os <word>`
                    ]
                },

                pl : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Polish to English',
                    syntax  : [
                        `${trigger}pl <word>`
                    ]
                },

                pt : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Portuguese to English',
                    syntax  : [
                        `${trigger}pt <word>`
                    ]
                },

                qu : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Quechua to English',
                    syntax  : [
                        `${trigger}qu <word>`
                    ]
                },

                ro : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Romanian to English',
                    syntax  : [
                        `${trigger}ro <word>`
                    ]
                },

                ru : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Russian to English',
                    syntax  : [
                        `${trigger}ru <word>`
                    ]
                },

                sc : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from sc to English',
                    syntax  : [
                        `${trigger}sc <word>`
                    ]
                },

                si : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Singhalese to English',
                    syntax  : [
                        `${trigger}si <word>`
                    ]
                },

                sl : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Slovenian to English',
                    syntax  : [
                        `${trigger}sl <word>`
                    ]
                },

                sm : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Samoan to English',
                    syntax  : [
                        `${trigger}sm <word>`
                    ]
                },

                so : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Somali to English',
                    syntax  : [
                        `${trigger}so <word>`
                    ]
                },

                sq : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Albanian to English',
                    syntax  : [
                        `${trigger}sq <word>`
                    ]
                },

                su : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Sudanese to English',
                    syntax  : [
                        `${trigger}su <word>`
                    ]
                },

                sv : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Swedish to English',
                    syntax  : [
                        `${trigger}sv <word>`
                    ]
                },

                tl : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Tagalog to English',
                    syntax  : [
                        `${trigger}tl <word>`
                    ]
                },

                tr : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Turkish to English',
                    syntax  : [
                        `${trigger}tr <word>`
                    ]
                },

                ug : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from ug to English',
                    syntax  : [
                        `${trigger}ug <word>`
                    ]
                },


                vi : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Vietnamese to English',
                    syntax  : [
                        `${trigger}vi <word>`
                    ]
                },

                yi : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Yiddish to English',
                    syntax  : [
                        `${trigger}yi <word>`
                    ]
                },

                zh : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Chinese to English',
                    syntax  : [
                        `${trigger}zh <word>`
                    ]
                },

                zu : {
                    f       : this.translateEnglishTo,
                    desc    : 'translate from Zulu to English',
                    syntax  : [
                        `${trigger}zu <word>`
                    ]
                }
            },
            regex : {
                [ `${complexTranslation}` ] : {
                    f       : this.complexTranslation,
                    desc    : 'translate between 2 languages. see https://www.sitepoint.com/iso-2-letter-language-codes/ for a list of short codes',
                    syntax  : [
                        `${trigger}en|de <words>`,
                        `${trigger}az|ng <words>`,
                        `${trigger}zh|ja <words>`
                    ]
                }
            }
        };
    }


    /**
     * ## scramble
     *
     * scrambles a word
     *
     * @param {String} word word to scramble
     *
     * @return {Void} scrambled word
     */
    scramble( word )
    {
console.log( 'disabled for now' );
        // var originalWord = word;

        // word = word.split( '' );
        // var currentIndex = word.length, temporaryValue, randomIndex ;

        // while ( currentIndex !== 0)
        // {
        //     randomIndex = Math.floor( Math.random() * currentIndex );
        //     currentIndex--;

        //     temporaryValue         = word[ currentIndex ];
        //     word[  currentIndex ]  = word[ randomIndex ];
        //     word[  randomIndex ]   = temporaryValue;
        // }

        // word = word.join( '' );

        // return ( word === originalWord ) ? this.scramble( word ) : word;
    }


    /**
     * ## showVerboseDef
     *
     * shows the verbose definition to the last winner, then clears the listener
     *
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {Void}
     */
    showVerboseDef( confObj )
    {
console.log( 'disabled for now' );
        // var _def = `${activeWord.verboseDef[1]} -\n`;

        // for ( var ii = 0, lenII = activeWord.verboseDef[2].length; ii < lenII; ii++ )
        // {
        //     _def += `${ii + 1}: ${activeWord.verboseDef[2][ ii ].text}\n`;
        // }

        // _bot.say( wordsChannel, _def, confObj );

        // activeWord.verboseDef = false;
    }


    /**
     * ## translate
     *
     * translates a word from one language to another
     *
     * @param {String} langFrom language to translate from
     * @param {String} langTo language to translate to
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {String} text original text
     * @param {Function} func callback function
     *
     * @return {Void}
     */
    translate( langFrom, langTo, from, to, text, func )
    {
        const { userConfig } = this;

        return new Promise( ( resolve, reject ) =>
        {
            if ( text[0] === userConfig.trigger )
            {
                text = text.replace( ( userConfig.trigger ) + langTo, '' ).trim();
            }
            else
            {
                text = text.replace( langTo, '' ).trim();
            }

            text = encodeURIComponent( text );

            var url = `${userConfig.translationBaseUrl}get?q=${text}&langpair=${langFrom}|${langTo}`;

            this._modules.core.apiGet( url, function( response )
            {
                var botText;
                response = response.matches;

                for ( var i = 0, lenI = response.length; i < lenI; i++ )
                {
                    if ( response[ i ].quality !== '0' )
                    {
                        botText = response[ i ].translation;
                        break;
                    }
                }

                if ( botText )
                {
                    if ( botText.indexOf( '|' ) !== -1 )
                    {
                        botText = botText.split( '|' )[1].slice( 1 );
                    }

                    if ( from !== 'internal' )
                    {
                        resolve( `${to}: ${langFrom} > ${langTo} - ${botText}` );
                    }

                    if ( func )
                    {
                        func( botText );
                    }
                }
                else
                {
                    resolve( `Sorry ${to}, that didnt work.  Check your country codes maybe.` );
                }
            }, false, from, to );
        } );
    }


    /**
     * ## translateEnglishTo
     *
     * handles the short form to translate english to languages
     *
     * @param {String} to originating user
     * @param {String} text message text
     * @param {Array} textArr text broken into an array of words
     * @param {String} command text that triggered the bot
     *
     * @return {String}
     */
    translateEnglishTo( from, to, text, textArr, command )
    {
        if ( this.activeWord.define )
        {
            return this.translate( 'en', command, from, to, text );
        }

        return '';
    }


    /**
     * ## word
     *
     * gets a new english word
     *
     * @param {String} from originating channel
     * @param {String} to originating user
     * @param {Object} confObj extra config object that some command modules need
     *
     * @return {Void}
     */
    word( from, to, confObj )
    {
console.log( 'disabled for now' );
    //     return new Promise( ( resolve, reject ) =>
    //     {
    //         if ( activeWord.currentWord === '' )
    //         {
    //             var self = this;
    //             var excludeList = 'excludePartOfSpeech=affix&' +
    //                                 'excludePartOfSpeech=noun-plural&' +
    //                                 'excludePartOfSpeech=noun-possesive&' +
    //                                 'excludePartOfSpeech=given-name&' +
    //                                 'excludePartOfSpeech=family-name&' +
    //                                 'excludePartOfSpeech=suffix&' +
    //                                 'excludePartOfSpeech=proper-noun&' +
    //                                 'excludePartOfSpeech=idiom&' +
    //                                 'excludePartOfSpeech=phrasal-prefix&';

    //             var url =  `${userConfig.wordnikBaseUrl}words.json/randomWord?hasDictionaryDef=true&${excludeList}minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=3&maxDictionaryCount=-1&minLength=${activeWord.minLength}&maxLength=${activeWord.maxLength}&api_key=${userConfig.wordnikAPIKey}`;

    //             this._modules.core.apiGet( url, function( result )
    //             {
    //                 if ( result.word[0] !== result.word[0].toLowerCase() ||
    //                         result.word.indexOf( '-' ) !== -1 ||
    //                         result.word.match( /^[a-zA-Z]+$/ ) === null )
    //                 {
    //                     resolve( self.word() );
    //                 }
    //                 else
    //                 {
    //                     resolve( self.processNewWord.call( self, result, to, activeWord, confObj ) );
    //                 }
    //             }, false, from, to );
    //         }
    //         else
    //         {
    //             resolve( `${copy.currentWord[ lang ]}${activeWord.scrambledWord.toLowerCase()} (${activeWord.currentWord[0].toLowerCase()})\n` );
    //         }
    //     } );
    }
};

module.exports = Words;

    /**
     * ## removeNico
     *
     * removes all the dynamic commands
     */
    // removeNico( nico )
    // {
    //     const { remove } = this.dynamic;

    //     remove( `flipthe${nico}` );
    //     remove( `flip${nico}` );
    //     remove( `putthe${nico}back` );
    //     remove( `is${nico}flipped?` );
    //     remove( `is${nico}abadperson?` );
    // }


    /**
     * ## setNico
     *
     * sets all the dynamic commands
     */
    // setNico( newNico )
    // {
    //     const { trigger } = this.userConfig;

    //     const nico = this.userConfig.nico = newNico;
    //     const { insert } = this.dynamic;

    //     insert( `flipthe${nico}`, {
    //         f           : this.fipTheNico,
    //         desc        : `show the ${nico} who\'s boss`,
    //         syntax      : [
    //             `${trigger}flipthe${nico}`
    //         ]
    //     } );

    //     insert( `flip${nico}`, {
    //         f           : this.fipTheNico,
    //         desc        : `show the ${nico} who\'s boss`,
    //         syntax      : [
    //             `${trigger}flip${nico}`
    //         ]
    //     } );

    //     insert( `putthe${nico}back`, {
    //         f           : this.putTheNicoBack,
    //         desc        : `have pity on the poor ${nico}`,
    //         syntax      : [
    //             `${trigger}putthe${nico}back`
    //         ]
    //     } );

    //     insert( `is${nico}flipped?`, {
    //         f           : this.isNicoFlipped,
    //         desc        : `report the ${nico} status`,
    //         syntax      : [
    //             `${trigger}is${nico}flipped?`
    //         ]
    //     } );

    //     insert( `is${nico}abadperson?`, {
    //         f           : this.isNicoABadPerson,
    //         desc        : 'an obvious question',
    //         syntax      : [
    //             `${trigger}is${nico}abadperson?`
    //         ]
    //     } );

    // }




/**
 * words responses
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
// responses( from, to, text, botText, command, confObj )
// {
    // if ( from === wordsChannel )
    // {
    //     switch ( command )
    //     {
    //         case copy.wordRes[ lang ]:
    //             return this.word( from, to, confObj );

    //         case copy.newWordRes[ lang ]:
    //             return this.newWord( from, to, confObj );
    //     }
    // }
//     return botText;
// }
//
//
