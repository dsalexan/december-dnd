import _ from 'lodash'
import { getPaths } from './object'
import { isValid } from './value'

export const CHARACTER_DEFAULT = {
  edit: {
    initiative: true,
    avatar: true,
    ac: true,
    name: true,
    source: true,
    type: true,
    level: true,
    cr: true,
    // abilities: true,
    abilities: {
      value: true
    },
    // tags: true,
    tags: {
      size: true,
      speed: true,
      saves: true,
      skills: true,
      vulnerable: true,
      resist: true,
      immune: true,
      conditionImmune: true,
      senses: true,
      languages: true,
      spellcasting: true,
      _conditions: true
    },
    _hp: true,
    // _roll: true,
    _rolls: {
      initiative: true
    },
    remove: false
  },
  view: {
    initiative: true,
    avatar: true,
    ac: true,
    name: true,
    source: true,
    type: true,
    alignment: true,
    level: true,
    cr: true,
    // abilities: false,
    abilities: {
      value: true
    },
    // tags: false,
    tags: {
      size: true,
      speed: true,
      saves: true,
      skills: true,
      vulnerable: true,
      resist: true,
      immune: true,
      conditionImmune: true,
      senses: true,
      languages: true,
      spellcasting: true,
      _conditions: true
    },
    _hp: true,
    // _roll: false,
    _rolls: {
      initiative: true
    }
  }
}

export const CHARACTER_PERSONAL = extend('character', {})

export const CHARACTER_PARTY = extend('character', {
  edit: false,
  view: {
    ac: false,
    cr: false,
    abilities: false,
    tags: false,
    _hp: false,
    _rolls: false
  }
})

export const CHARACTER_NPC = extend('character', {
  edit: false,
  view: {
    ac: false,
    level: false,
    cr: false,
    abilities: false,
    alignment: false,
    tags: false,
    _hp: false,
    _rolls: false
  }
})

export const CHARACTER_HIDDEN = extend('character', {
  edit: false,
  view: false
})

export const CHARACTER_ADMIN = extend('character', {
  edit: true,
  view: true
})

export const GLOBAL_DEFAULT = {
  view: {
    edit: false,
    debug: false,
    add: false,
    initiative: false,
    pages: {
      tracker: true,
      editor: false,
      avatar: false,
      users: false,
      pusher: false
    }
  }
}

export const GLOBAL_ADMIN = extend('global', {
  view: true
})

export const INDEX_DEFAULT = {
  __GLOBAL__: [
    {
      text: 'Default',
      value: 'global:default'
    },
    {
      text: 'Admin',
      value: 'global:admin'
    }
  ],
  __CHARACTER__: [
    {
      text: 'Default',
      value: 'character:default'
    },
    {
      text: 'Hidden',
      value: 'character:hidden'
    },
    {
      text: 'Personal',
      value: 'character:personal'
    },
    {
      text: 'Party',
      value: 'character:party'
    },
    {
      text: 'NPC',
      value: 'character:npc'
    },
    {
      text: 'Admin',
      value: 'character:admin'
    }
  ]
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
    else if (t1 === 'hidden') return _.cloneDeep(CHARACTER_HIDDEN)
    else if (t1 === 'admin') return _.cloneDeep(CHARACTER_ADMIN)
    else if (t1 === 'npc') return _.cloneDeep(CHARACTER_NPC)
  } else if (t0 === 'global') {
    if (t1 === 'admin') return _.cloneDeep(GLOBAL_ADMIN)
  }
}

export function extend(scope, p2) {
  let p1 = _.isString(scope) ? defaults(scope) : scope

  p1 = _.mergeWith(p1, p2, (obj, src, key, object, source) => {
    const obj_type = _.isArray(obj) ? 'array' : typeof obj
    const src_type = _.isArray(src) ? 'array' : typeof src

    if (obj_type === src_type && obj_type === 'array') {
      return [...obj, ...src]
    } else if (obj_type === 'array' || src_type === 'array') {
      debugger
    }

    if (obj_type !== src_type) {
      if (obj_type === 'object') {
        // eslint-disable-next-line no-unused-vars
        const paths = getPaths(obj)

        if (src_type === 'boolean') {
          for (const path of paths) {
            _.set(obj, path, src)
          }
          return obj
        } else {
          debugger
        }
      } else if (obj === undefined && src !== undefined) {
        return src
      } else {
        debugger
      }
    }
  })
  return p1
}

export function nestedValue(obj) {
  if (!isValid(obj)) return false
  if (_.isBoolean(obj)) return obj
  else if (_.isArray(obj)) {
    const nested = obj.map(nestedValue)
    const all_equal = nested.every((val, i, arr) => val === arr[0])
    return all_equal ? nested[0] : undefined

    // avalia se são todos iguais
  } else if (_.isObjectLike(obj)) {
    const values = Object.values(obj)
    return nestedValue(values)
  } else {
    // what???
    debugger
    // console.trace('NESTED VALUE', obj, typeof obj)
    // return false
  }
}
