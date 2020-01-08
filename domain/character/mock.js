import * as Character from '@/domain/character'

const base = [
  {
    name: 'Luke Undell',
    source: 'FCS',
    type: {
      type: 'Humanoid',
      tags: ['Human', 'Variant Human']
    },
    background: 'Gravedigger',
    level: [
      {
        level: 1,
        takenAt: [1],
        class: {
          name: 'Fighter'
        }
      },
      {
        level: 4,
        takenAt: [2, 3, 4, 5],
        class: {
          name: 'Monk'
        },
        subclass: {
          name: 'The Way of the Zoroaster',
          source: 'FCS'
        }
      }
    ],
    str: 10,
    dex: 14,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    _fluff: {
      images: [
        {
          type: 'image',
          href: {
            type: 'external',
            path: 'https://cdn.vuetifyjs.com/images/lists/1.jpg'
          }
        }
      ]
    },
    _rolls: {
      initiative: 10
    }
  },
  {
    name: 'Avir Yvrani',
    source: 'FCS',
    type: {
      type: 'Humanoid',
      tags: ['Human', 'Variant Human']
    },
    background: 'Outlander',
    level: [
      {
        level: 20,
        class: {
          name: 'Monk'
        },
        subclass: {
          name: 'The Way of the Zoroaster',
          source: 'FCS'
        }
      }
    ],
    ac: [
      {
        ac: 19,
        from: ['Unarmored Defense']
      },
      {
        ac: 20,
        from: ['Unarmored Defense', 'Breathing Techiniques']
      }
    ],
    speed: {
      walk: 60,
      fly: {
        number: 90,
        condition: '(Legacy of the Stars)'
      },
      canHover: true
    },
    // avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
    str: 10,
    dex: 20,
    con: 10,
    int: 10,
    wis: 18,
    cha: 10,
    save: {
      dex: true,
      con: '+16',
      wis: '+12'
    },
    skill: {
      athletics: true,
      acrobatics: {
        ratio: 2
      },
      deception: '+6',
      insight: '+5',
      intimidation: '+6'
    },
    senses: ["darkvision 120 ft. (see devil's sight below)"],
    languages: ['Common', 'Infernal'],
    vulnerable: [
      {
        vulnerable: ['piercing'],
        note: 'from magic weapons wielded by good creatures'
      }
    ],
    resist: [
      'fire',
      'poison',
      {
        resist: ['bludgeoning', 'piercing', 'slashing'],
        note: 'from nonmagical attacks'
      }
    ],
    immune: [
      'cold',
      'poison',
      {
        immune: ['bludgeoning', 'piercing', 'slashing'],
        note: 'from nonmagical attacks'
      }
    ],
    conditionImmune: ['frightened'],
    _conditions: [
      'disease',
      'prone',
      {
        name: 'exhaustion',
        value: 2
      },
      {
        name: 'blinded',
        condition: 'when his eyes are closed'
      }
    ]
  }
]

export const characters = base.map((c) => Character.make(c))

export const characters_index = characters.reduce(
  (obj, cur, index) => ({
    ...obj,
    [cur._id]: index
  }),
  {}
)

export default {
  characters,
  characters_index
}
