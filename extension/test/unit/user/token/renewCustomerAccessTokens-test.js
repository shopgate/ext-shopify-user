const assert = require('assert')
const renewCustomerAccessTokens = require('../../../../user/token/renewCustomerAccessTokens')

describe('user / token / renewCustomerAccessTokens', () => {
  let context = {}

  const input = {
    pipelineApiKey: 'fancyApiKey'
  }

  beforeEach(() => {
    context = {
      storage: {
        extension: {
          set: async () => { },
          get: async () => { }
        }
      }
    }
  })

  it('should return an UnauthorizedError as no apiKey was supplied', async () => {
    try {
      await renewCustomerAccessTokens(context, {})
    } catch (e) {
      assert.strictEqual('EACCESS', e.code)
    }
  })

  it('should return an UnauthorizedError as the apiKey does not match', async () => {
    context.storage.extension.get = async () => {
      return 'wrongKey'
    }

    try {
      await renewCustomerAccessTokens(context, input)
    } catch (e) {
      assert.strictEqual('EACCESS', e.code)
    }
  })
})
