const nock = require('nock')
const assert = require('assert')
const StorefrontApi = require('../../../lib/shopify.api.storefront')
const baseUrl = 'https://shopgate.myshopify.com'
const apiEndpoint = '/api/2023-10/graphql'

describe('Shopify Storefront API', () => {
  let subjectUnderTest
  let contextLogDummy
  let tokenManager

  beforeEach(() => {
    contextLogDummy = {
      debug: () => {},
      info: () => {},
      error: () => {}
    }

    tokenManager = {
      getStorefrontAccessToken: () => '12345'
    }

    subjectUnderTest = new StorefrontApi(baseUrl, tokenManager, contextLogDummy, () => {})
  })

  describe('Request logging', () => {
    it('should log every request', async () => {
      nock(baseUrl)
        .post(apiEndpoint)
        .reply(200, {})

      let logCallCount = 0
      subjectUnderTest.requestLog = (requestOptions, response) => {
        logCallCount++
        assert.strictEqual(requestOptions.uri, baseUrl + apiEndpoint)
        assert.strictEqual(response.statusCode, 200)
        assert.deepStrictEqual(response.body, {})
      }

      await subjectUnderTest.request('some dummy GraphQL query')
      assert.strictEqual(logCallCount, 1)
    })

    it('should obfuscate the password ', async () => {
      nock(baseUrl)
        .post(apiEndpoint)
        .reply(200, {})

      let logCallCount = 0
      subjectUnderTest.requestLog = (requestOptions, response) => {
        logCallCount++
        assert.strictEqual(requestOptions.body.variables.input.password, 'XXXXXXXX')
        assert.strictEqual(requestOptions.uri, baseUrl + apiEndpoint)
        assert.strictEqual(response.statusCode, 200)
        assert.deepStrictEqual(response.body, {})
      }

      await subjectUnderTest.request('some dummy GraphQL query', { input: { password: '12345' } })
      assert.strictEqual(logCallCount, 1)
    })
  })
})
