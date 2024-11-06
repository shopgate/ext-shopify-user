const assert = require('assert')
const updateAddress = require('../../../../user/address/update')

describe('user / address / update', () => {
  const context = {
    meta: {
      userId: null
    },
    log: { debug: () => {} }
  }

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await updateAddress(context)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
