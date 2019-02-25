const assert = require('assert')
const updateUser = require('../../../user/update')

describe('extension / user / requestShopifyUserId', () => {
  const context = {
    meta: {
      userId: null
    }
  }
  const input = {}

  beforeEach(() => {
    input.customAttributes = null
    input.firstName = null
    input.lastName = null
  })

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await updateUser(context, input)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })

  it('should throw an invalid call error if user the input is wrong', async () => {
    context.meta.userId = 1
    try {
      await updateUser(context, input)
    } catch (err) {
      return assert.strictEqual(err.code, 'EINVALIDCALL')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
