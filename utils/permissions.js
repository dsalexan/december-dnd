import _ from 'lodash'

export const CHARACTER_DEFAULT = {
  view: {
    initiative: true,
    avatar: true,
    ac: true,
    name: true,
    source: true,
    type: true,
    level: true,
    cr: true,
    // abilities: false,
    abilities: {
      value: true
    },
    // tags: false,
    tags: {
      speed: true,
      saves: true,
      skills: true,
      vulnerable: true,
      resist: true,
      immune: true,
      conditionImmune: true,
      senses: true,
      languages: true,
      _conditions: true
    },
    _hp: true,
    // _roll: false,
    _rolls: {
      initiative: true
    }
  }
}

export const CHARACTER_PERSONAL = _.cloneDeep(CHARACTER_DEFAULT)

export const CHARACTER_PARTY = {
  view: {
    ..._.cloneDeep(CHARACTER_DEFAULT).view,
    ac: false,
    cr: false,
    abilities: false,
    tags: false,
    _hp: false,
    _rolls: false
  }
}

export const GLOBAL_DEFAULT = {
  EDIT: false
}

export function defaults(scope) {
  // eslint-disable-next-line no-unused-vars
  const [t0, t1, t2, t3] = scope.split(':')

  if (t1 === undefined) {
    if (t0 === 'character') return _.cloneDeep(CHARACTER_DEFAULT)
    else if (t0 === 'global') return _.cloneDeep(GLOBAL_DEFAULT)
  }

  if (t0 === 'character') {
    if (t1 === 'personal') return _.cloneDeep(CHARACTER_PERSONAL)
    else if (t1 === 'party') return _.cloneDeep(CHARACTER_PARTY)
  }
}
