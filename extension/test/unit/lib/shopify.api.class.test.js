const nock = require('nock')
const sinon = require('sinon')
const assert = require('assert')
const Logger = require('../../../lib/logger')
const SGShopifyApi = require('../../../lib/shopify.api.class')
const shopifyApiUrl = 'https://shopgate.myshopify.com'
const shopifyEndpoint = '/sample/endpoint'
const shopifyGraphQlUrl = '/api/graphql'
const httpCodeSuccess = 200
const context = {
  config: {
    shopifyShopAlias: 'shopgate',
    shopifyAccessToken: 'token'
  },
  log: {
    debug: () => {}
  }
}
const logSpy = sinon.spy(context.log, 'debug')
const Shopify = new SGShopifyApi(context)
let logRequest

describe('Shopify API', () => {
  beforeEach(() => {
    logRequest = new Logger(context.log, {})
  })

  it('should create logs for all GET requests', () => {
    nock(shopifyApiUrl)
      .get(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    Shopify.getRequest(shopifyEndpoint, {}, () => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })

  it('should create logs for all POST requests', () => {
    nock(shopifyApiUrl)
      .post(shopifyEndpoint)
      .reply(httpCodeSuccess, {})

    Shopify.postRequest(shopifyEndpoint, {}, () => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })

  it('should create logs for all PUT requests', () => {
    nock(shopifyApiUrl)
      .put(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    Shopify.putRequest(shopifyEndpoint, {}, () => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })

  it('should create logs for all DELETE requests', () => {
    nock(shopifyApiUrl)
      .delete(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    Shopify.deleteRequest(shopifyEndpoint, {}, () => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })

  it('should NOT log passwords', () => {
    const body = {
      data: {
        customerAccessTokenCreate: {
          customerAccessToken: 'token'
        }
      }
    }

    nock(shopifyApiUrl)
      .post(shopifyGraphQlUrl)
      .reply(httpCodeSuccess, function() {
        return body
      })

    const login = {
      login: 'username',
      password: 'supersecretpassword'
    }

    Shopify.checkCredentials(Shopify, 'supersecrettoken', login, {}, (err, login) => {
      assert.equal(JSON.stringify(body).includes(login.password), false)
    })
  })
})
