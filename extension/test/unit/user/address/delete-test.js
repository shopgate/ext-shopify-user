const assert = require('assert')
const deleteAddress = require('../../../../user/address/delete')

describe('user / address / delete', () => {
  const context = {
    meta: {
      userId: null
    },
    log: { debug: () => {} }
  }

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await deleteAddress(context)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
