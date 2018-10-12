const sinon = require('sinon')
const assert = require('assert')
const moment = require('moment')
const TokenManagerClass = require('../../../lib/CustomerTokenManager')
const UnauthorizedError = require('../../../models/Errors/UnauthorizedError')

describe('CustomerTokenManager', () => {
  let TokenManager

  const context = {
    log: {
      error: () => {}
    },
    meta: {
      userId: 1
    },
    storage: {
      user: {
        get: async () => {},
        set: async () => {}
      },
      extension: {
        get: async () => {},
        map: async () => {}
      }
    }
  }

  describe('getToken()', () => {
    beforeEach(() => {
      context.storage.user.get = async () => {}
      context.storage.user.set = async () => {}
      context.storage.extension.get = async () => {}
      context.storage.extension.map = async () => {}
    })

    it('should throw an unauthorized error when no token is available', async () => {
      TokenManager = new TokenManagerClass(context)
      try {
        await TokenManager.getToken()
      } catch (err) {
        assert.equal(err.code, 'EACCESS')
      }
    })

    it('should return the token from the storage', async () => {
      const accessToken = 'token'
      const expiresAt = moment(Date.now()).add(1, 'week')
      context.storage.user.get = async () => {
        return { accessToken, expiresAt }
      }

      TokenManager = new TokenManagerClass(context)
      const fetchedToken = await TokenManager.getToken()
      assert.equal(fetchedToken.accessToken, accessToken)
      assert.equal(fetchedToken.expiresAt, expiresAt)
    })

    it('should renew the token if the token expired and another valid one is already stored in cache', async () => {
      const oldToken = { accessToken: 'token-old', expiresAt: moment(Date.now()).subtract(1, 'day') }
      const newToken = { accessToken: 'token-new', expiresAt: moment(Date.now()).add(1, 'week') }

      context.storage.user.get = async () => {
        return oldToken
      }
      context.storage.extension.map.getItem = async () => {
        return newToken
      }

      const storageSetSpy = sinon.spy(context.storage.user, 'set')
      TokenManager = new TokenManagerClass(context)
      const fetchedToken = await TokenManager.getToken()

      sinon.assert.calledWith(storageSetSpy, 'customerAccessToken', newToken)
      assert.equal(fetchedToken.accessToken, newToken.accessToken)
      assert.equal(fetchedToken.expiresAt, newToken.expiresAt)
    })

    it('should throw an unauthorized error when all tokens from cache expired', async () => {
      const firstToken = { accessToken: 'token-old', expiresAt: moment(Date.now()).subtract(2, 'day') }
      const secondToken = { accessToken: 'token-new', expiresAt: moment(Date.now()).subtract(1, 'day') }

      context.storage.user.get = async () => {
        return firstToken
      }
      context.storage.extension.map.getItem = async () => {
        return secondToken
      }

      try {
        await TokenManager.getToken()
        assert.fail('NO exception thrown')
      } catch (err) {
        assert.equal(err.code, 'EACCESS')
      }
    })
  })
})
