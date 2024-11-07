const assert = require('assert')
const addAddress = require('../../../../user/address/add')

describe('user / address / add', () => {
  const context = {
    meta: {
      userId: null
    },
    log: { debug: () => {} }
  }

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await addAddress(context)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
