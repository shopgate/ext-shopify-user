const assert = require('assert')
const updatePassword = require('../../../../user/password/update')

describe('user / password / update', () => {
  const context = {
    meta: {},
    log: { debug: () => {} }
  }
  const input = {}

  beforeEach(() => {
    input.password = null
    context.meta.userId = null
  })

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await updatePassword(context, input)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })

  it('should throw a validation error if no password was supplied', async () => {
    context.meta.userId = 1
    try {
      await updatePassword(context, input)
    } catch (err) {
      assert.strictEqual(err.validationErrors[0].path, 'password')
      return assert.strictEqual(err.code, 'EVALIDATION')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
