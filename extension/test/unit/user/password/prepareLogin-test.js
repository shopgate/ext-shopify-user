const assert = require('assert')
const prepareLogin = require('../../../../user/password/prepareLogin')

describe('user / password / prepareLogin', () => {
  const context = {}
  const input = {
    username: null
  }

  beforeEach(() => {
    input.username = null
  })

  it('should throw an invalid error if no username was supplied', async () => {
    try {
      await prepareLogin(context, input)
    } catch (err) {
      return assert.strictEqual(err.code, 'EINVALIDCALL')
    }
    assert.fail('Expected an error to be thrown.')
  })

  it('should throw a validation error if no old password was supplied', async () => {
    input.username = 'fake name'
    try {
      await prepareLogin(context, input)
    } catch (err) {
      assert.strictEqual(err.validationErrors[0].path, 'oldPassword')
      return assert.strictEqual(err.code, 'EVALIDATION')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
