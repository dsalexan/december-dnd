import { Validator } from 'jsonschema'

const level = {
  id: '/level',
  type: 'object',
  properties: {
    level: {
      type: ['integer', 'string'],
      required: true
    },
    takenAt: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: ['integer', 'string']
      }
    },
    class: {
      anyOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              required: true
            },
            source: {
              type: 'string'
            }
          }
        }
      ]
    },
    subclass: {
      anyOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              required: true
            },
            source: {
              type: 'string'
            }
          }
        }
      ]
    }
  }
}

const level_composition = {
  id: '/level-composition',
  anyOf: [
    {
      type: ['integer', 'string']
    },
    {
      $ref: '/level'
    },
    {
      type: 'array',
      items: {
        type: {
          $ref: '/level'
        }
      }
    }
  ]
}

const v = new Validator()
v.addSchema(level, '/level')

export default (instance) => {
  const test = v.validate(instance, level_composition)
  // debugger
  return test
}
