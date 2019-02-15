const assert = require('assert')
const getAddress = require('../../../../user/address/get')

describe('user / address / get', () => {
  const context = {
    meta: {
      userId: null
    }
  }

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await getAddress(context)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
