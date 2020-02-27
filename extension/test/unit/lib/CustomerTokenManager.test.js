const sinon = require('sinon')
const assert = require('assert')
const moment = require('moment')
const ShopifyApiFactory = require('../../../lib/shopify.api.factory')

describe('CustomerTokenManager', () => {
  let TokenManager
  let context = {}
  let storage = {}
  const loggerStub = {
    error: () => {}
  }

  describe('getToken()', () => {
    beforeEach(() => {
      storage = {
        get: async () => {},
        set: async () => {}
      }
      context = {
        storage: {
          user: storage,
          device: storage,
          extension: storage
        },
        meta: { userId: 1 },
        log: loggerStub
      }
    })

    it('should throw an unauthorized error when no token is available', async () => {
      TokenManager = ShopifyApiFactory.buildCustomerTokenManager(context)
      try {
        await TokenManager.getToken()
      } catch (err) {
        return assert.strictEqual(err.code, 'EACCESS')
      }
      assert.fail('Expected an error to be thrown.')
    })

    it('should return the token from the storage', async () => {
      const accessToken = 'token'
      const expiresAt = moment(Date.now()).add(1, 'week')
      context.storage.user.get = async () => {
        return { accessToken, expiresAt }
      }

      TokenManager = ShopifyApiFactory.buildCustomerTokenManager(context)
      const fetchedToken = await TokenManager.getToken()
      assert.strictEqual(fetchedToken.accessToken, accessToken)
      assert.strictEqual(fetchedToken.expiresAt, expiresAt)
    })

    it('should throw an unauthorized error when all tokens from cache expired', async () => {
      const firstToken = { accessToken: 'token-old', expiresAt: moment(Date.now()).subtract(2, 'day') }

      context.storage.user.get = async () => {
        return firstToken
      }

      TokenManager = ShopifyApiFactory.buildCustomerTokenManager(context)

      try {
        await TokenManager.getToken()
      } catch (err) {
        return assert.strictEqual(err.code, 'EACCESS')
      }
      assert.fail('Expected an error to be thrown.')
    })

    it('should save a token to the user storage', async () => {
      const storageSetSpy = sinon.spy(context.storage.user, 'set')
      const newToken = { accessToken: 'token-new', expiresAt: moment(Date.now()).add(1, 'week') }

      TokenManager = ShopifyApiFactory.buildCustomerTokenManager(context)
      await TokenManager.setToken(newToken)
      sinon.assert.calledWith(storageSetSpy, 'customerAccessToken', newToken)
    })
  })
})
