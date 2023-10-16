const nock = require('nock')
const assert = require('assert')
const AdminApi = require('../../../lib/shopify.api.admin')
const baseUrl = 'https://shopgate.myshopify.com'
const dummyEndpoint = '/sample/endpoint'

describe('Shopify Admin API', () => {
  let subjectUnderTest

  beforeEach(done => {
    subjectUnderTest = new AdminApi(baseUrl, 'accessToken', (requestOptions, response) => {})

    done()
  })

  describe('Request logging', () => {
    it('should create logs for all requests', async () => {
      nock(baseUrl)
        .get(dummyEndpoint)
        .reply(200, {})

      let logCallCount = 0
      subjectUnderTest.requestLog = (requestOptions, response) => {
        logCallCount++
        assert.strictEqual(requestOptions.uri, baseUrl + dummyEndpoint)
        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(response.body, '{}')
      }

      await subjectUnderTest.request('GET', dummyEndpoint)
      assert.strictEqual(logCallCount, 1)
    })
  })

  describe('getStoreFrontAccessToken()', () => {
    const expectedToken = {
      title: 'Web Checkout Storefront Access Token',
      access_token: '9223372036854775807'
    }

    it('should fetch the storefront access token from the Admin API', async () => {
      nock(baseUrl)
        .get('/admin/api/2023-10/storefront_access_tokens.json')
        .reply(200, {
          storefront_access_tokens: [
            {
              title: 'trololol' // should be skipped
            },
            expectedToken
          ]
        })

      const actualToken = await subjectUnderTest.getStoreFrontAccessToken()

      assert.deepStrictEqual(actualToken, expectedToken)
    })

    it('should create a new storefront access token via Admin API if none is found', async () => {
      nock(baseUrl)
        .get('/admin/api/2023-10/storefront_access_tokens.json')
        .reply(200, {
          storefront_access_tokens: [
            {
              title: 'trololol' // should be skipped
            }
          ]
        })

      nock(baseUrl)
        .post('/admin/api/2023-10/storefront_access_tokens.json')
        .reply(200, expectedToken)

      const response = await subjectUnderTest.getStoreFrontAccessToken()
      assert.deepStrictEqual(response, expectedToken)
    })
  })
})
