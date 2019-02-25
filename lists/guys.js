module.exports = [
  // guys
  {
    triggers: ['guys', 'dudes', 'bros'],

    alternatives: [
      'you all',
      'yiz',
      'you-uns',
      'yinz',
      'you lot',
      'allyou',
      'yer',
      'team',
      'squad',
      'gang',
      'pals',
      'buds',
      'posse',
      'phalanx',
      'crew',
      'crüe',
      'nerds',
      'friends',
      'fellow-humans',
      'folks',
      'people',
      'peeps',
      'friends',
      'chums',
      'everyone',
      'you lot',
      'youse',
      "y'all",
      'peers',
      'comrades',
    ],

    speech: [
      ['why not ', '?'],
      ['why not say ', '?'],
      ['I think you meant ', '.'],
      ['perhaps you meant ', '?'],
      ['surely you meant ', '.'],
      ['you probably meant ', '.'],
      ["are you sure you didn't mean ", '?'],
      ["we're more of a ", ''],
      ["we're all ", ''],
    ],
  },

  // girls
  {
    triggers: ['girls'],

    alternatives: ['ladies', 'women'],

    speech: [
      ['I think you meant ', '.'],
      ['perhaps you meant ', '?'],
      ['surely you meant ', '.'],
      ['you probably meant ', '.'],
      ["are you sure you didn't mean ", '?'],
    ],
  },

  // retarded
  {
    triggers: ['retarded', 'herp', 'derp'],

    alternatives: [
      'bad',
      'uninteresting',
      'boring',
      'nonsensical',
      'awful',
      'silly',
      'ridiculous',
      'illogical',
      'terrible',
    ],

    speech: [['I think you meant ', '...']],
  },

  // crazy
  {
    triggers: ['crazy', 'insane'],

    alternatives: [
      'bad',
      'illogical',
      'erratic',
      'nonsensical',
      'ridiculous',
      'uncontrolled',
      'unpredictable',
      'strange',
      'unusual',
    ],

    speech: [['I think you meant ', '...']],
  },

  // lame
  {
    triggers: ['lame'],

    alternatives: [
      'bad',
      'boring',
      'frustrating',
      '"a waste of time"',
      'tiresome',
      'unoriginal',
      'uncreative',
      'dissappointing',
      'embarrassing',
      'tedious',
    ],

    speech: [['Lame? Dont you think ', ' sounds better?']],
  },

  // dumb
  {
    triggers: ['dumb', 'stupid', 'idiot'],

    alternatives: [
      'bad',
      'illogical',
      'incorrect',
      'ridiculous',
      'unthinkable',
      'silly',
      'trifling',
      'pandering',
    ],

    speech: [["Come on! Don't you think ", ' sounds better?']],
  },
];
