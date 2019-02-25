const assert = require('assert')
const setDefaultAddress = require('../../../../user/address/setDefault')

describe('user / address / setDefault', () => {
  const context = {
    meta: {
      userId: null
    }
  }

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await setDefaultAddress(context)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
