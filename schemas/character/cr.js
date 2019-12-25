import { Validator } from 'jsonschema'

const cr = {
  id: '/cr',
  anyOf: [
    {
      type: 'integer'
    },
    {
      type: 'object',
      properties: {
        cr: {
          type: 'integer',
          required: true
        }
      },
      additionalProperties: {
        type: 'integer'
      }
    }
  ]
}

const v = new Validator()

export default (instance) => v.validate(instance, cr)
