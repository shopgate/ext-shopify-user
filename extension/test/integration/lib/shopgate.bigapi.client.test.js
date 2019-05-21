const nock = require('nock')
const BigApiClient = require('../../../lib/shopgate.bigapi.client')
const { ExternalBigAPI } = require('@shopgate/bigapi-requester')

describe('Shopgate BigAPI', () => {
  let subjectUnderTest
  let bigApiRequester
  const tokenHandlerStub = {}

  const baseUrl = 'shopgate.services/'
  const serviceName = 'task-scheduler'
  const version = 'v1'
  const path = '/schedules/shopifyRenewCustomerAccessToken-'

  beforeEach(done => {
    bigApiRequester = new ExternalBigAPI(tokenHandlerStub, 15000)

    // this flag is determined by checking if the token handler is an instance of TokenHandler - since we're using a
    // stub it wouldn't be used automatically, so force it
    bigApiRequester.handleTokensInternally = true

    subjectUnderTest = new BigApiClient(bigApiRequester)
    done()
  })

  it('should schedule customer token renewal for an application and stage', async () => {
    const applicationId = 'shop-31134'
    const stage = 'development'
    const pipelineApiKey = 'abcdef123456'

    // set up the stub
    tokenHandlerStub.credentials = { api: 'https://{serviceName}.' + baseUrl }
    tokenHandlerStub.getToken = () => { return { refreshToken: 'token', token: 'abcdef123456' } }

    nock(`https://${serviceName}.${baseUrl}`, { reqheaders: { authorization: 'Bearer abcdef123456' } })
      .put('/' + version + path + applicationId, {
        target: {
          type: 'http',
          params: {
            uri: `https://${applicationId}.${stage}.connect.shopgate.com/app/trustedPipelines/shopgate.user.renewCustomerAccessTokens.v1`,
            method: 'POST',
            json: true,
            headers: {
              cookie: `SGCONNECT=shopifyRenewCustomerAccessToken-${applicationId}`
            }
          }
        },
        arguments: {
          body: {
            pipelineApiKey
          }
        },
        cronPattern: '0 0 0 * * *',
        queue: 'shopifyRenewCustomerAccessTokens'
      })
      .reply(200, {})

    await subjectUnderTest.scheduleCustomerTokenRenew(stage, applicationId, pipelineApiKey)
  })
})
