import * as Character from '@/domain/character'

const base = [
  {
    name: 'Luke Undell',
    source: 'Fendas',
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
          source: 'Fendas'
        }
      }
    ],
    avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
    ability: {
      str: 10,
      dex: 14,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    },
    _rolls: {
      initiative: 10
    }
  },
  {
    name: 'Avir Yvrani',
    source: 'Fendas',
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
          source: 'Fendas'
        }
      }
    ],
    // avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
    ability: {
      str: 10,
      dex: 20,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    }
  }
]

export const characters = base.map((c) => Character.make(c))

export const characters_index = characters.reduce(
  (obj, cur) => ({
    ...obj,
    [cur._id]: cur
  }),
  {}
)

export default {
  characters,
  characters_index
}
