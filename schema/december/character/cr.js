import { Validator } from 'jsonschema'

const cr = {
  id: '/cr',
  anyOf: [
    {
      type: ['integer', 'string']
    },
    {
      type: 'object',
      properties: {
        cr: {
          type: ['integer', 'string'],
          required: true
        }
      },
      additionalProperties: {
        type: ['integer', 'string']
      }
    }
  ]
}

const v = new Validator()

export default (instance) => v.validate(instance, cr)
