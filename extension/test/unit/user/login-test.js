const assert = require('assert')
const login = require('../../../user/login')

describe('extension / user / login', () => {
  const context = {
    meta: {
      userId: null
    }
  }
  const input = {
    strategy: null
  }

  beforeEach(() => {
    input.strategy = null
  })

  it('should throw an invalid error if no supported login strategy was used', async () => {
    input.strategy = 'fakeStrategy'
    try {
      await login(context, input)
    } catch (err) {
      return assert.strictEqual(err.code, 'EINVALIDCALL')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
