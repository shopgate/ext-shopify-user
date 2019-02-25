const assert = require('assert')
const getUser = require('../../../user/get')

describe('extension / user / get', () => {
  const context = {
    meta: {
      userId: null
    }
  }

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await getUser(context)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
