const assert = require('assert')
const requestShopifyUserId = require('../../../user/requestShopifyUserId')

describe('extension / user / requestShopifyUserId', () => {
  const context = {
    meta: {
      userId: null
    },
    log: {
      error: () => {}
    }
  }
  const input = {
    strategy: null,
    customerId: null
  }

  beforeEach(() => {
    input.strategy = null
    input.customerId = null
  })

  it('should throw a customer not found error if there is no customerId for strategy web', async () => {
    input.strategy = 'web'
    try {
      await requestShopifyUserId(context, input)
    } catch (err) {
      return assert.strictEqual(err.code, 'ECUSTOMERNOTFOUND')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
