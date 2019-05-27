const sinon = require('sinon')
const assert = require('assert')
const moment = require('moment')
const TokenManagerClass = require('../../../lib/CustomerTokenManager')

describe('CustomerTokenManager', () => {
  let TokenManager
  let userStorageStub = {}
  let extensionStorageStub = {}
  const loggerStub = {
    error: () => { }
  }

  describe('getToken()', () => {
    beforeEach(() => {
      userStorageStub.get = async () => { }
      userStorageStub.set = async () => { }
      extensionStorageStub.get = async () => { }
      extensionStorageStub.map = async () => { }
      extensionStorageStub.map.setItem = async () => { }
    })

    it('should throw an unauthorized error when no token is available', async () => {
      TokenManager = new TokenManagerClass(userStorageStub, extensionStorageStub, loggerStub, 1)
      try {
        await TokenManager.getToken()
      } catch (err) {
        return assert.strict.equal(err.code, 'EACCESS')
      }
      assert.fail('Expected an error to be thrown.')
    })

    it('should return the token from the storage', async () => {
      const accessToken = 'token'
      const expiresAt = moment(Date.now()).add(1, 'week')
      userStorageStub.get = async () => {
        return { accessToken, expiresAt }
      }

      TokenManager = new TokenManagerClass(userStorageStub, extensionStorageStub, loggerStub, 1)
      const fetchedToken = await TokenManager.getToken()
      assert.strict.equal(fetchedToken.accessToken, accessToken)
      assert.strict.equal(fetchedToken.expiresAt, expiresAt)
    })

    it('should renew the token if the token expired and another valid one is already stored in cache', async () => {
      const oldToken = { accessToken: 'token-old', expiresAt: moment(Date.now()).subtract(1, 'day') }
      const newToken = { accessToken: 'token-new', expiresAt: moment(Date.now()).add(1, 'week') }

      userStorageStub.get = async () => {
        return oldToken
      }
      extensionStorageStub.map.getItem = async () => {
        return newToken
      }

      const storageSetSpy = sinon.spy(userStorageStub, 'set')
      TokenManager = new TokenManagerClass(userStorageStub, extensionStorageStub, loggerStub, 1)
      const fetchedToken = await TokenManager.getToken()

      sinon.assert.calledWith(storageSetSpy, 'customerAccessToken', newToken)
      assert.strict.equal(fetchedToken.accessToken, newToken.accessToken)
      assert.strict.equal(fetchedToken.expiresAt, newToken.expiresAt)
    })

    it('should throw an unauthorized error when all tokens from cache expired', async () => {
      const firstToken = { accessToken: 'token-old', expiresAt: moment(Date.now()).subtract(2, 'day') }
      const secondToken = { accessToken: 'token-new', expiresAt: moment(Date.now()).subtract(1, 'day') }

      userStorageStub.get = async () => {
        return firstToken
      }
      extensionStorageStub.map.getItem = async () => {
        return secondToken
      }

      TokenManager = new TokenManagerClass(userStorageStub, extensionStorageStub, loggerStub, 1)

      try {
        await TokenManager.getToken()
      } catch (err) {
        return assert.strict.equal(err.code, 'EACCESS')
      }
      assert.fail('Expected an error to be thrown.')
    })

    it('should save a token to the user storage', async () => {
      const storageSetSpy = sinon.spy(userStorageStub, 'set')
      const newToken = { accessToken: 'token-new', expiresAt: moment(Date.now()).add(1, 'week') }

      TokenManager = new TokenManagerClass(userStorageStub, extensionStorageStub, loggerStub, 1)
      await TokenManager.setToken(newToken)
      sinon.assert.calledWith(storageSetSpy, 'customerAccessToken', newToken)
    })
  })
})
