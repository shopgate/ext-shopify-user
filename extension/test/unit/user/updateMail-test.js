const assert = require('assert')
const updateMail = require('../../../user/updateMail')

describe('extension / user / updateMail', () => {
  const context = {
    meta: {
      userId: null
    }
  }

  it('should throw an unauthorized error if no user is logged in', async () => {
    try {
      await updateMail(context)
    } catch (err) {
      return assert.strictEqual(err.code, 'EACCESS')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
