const nock = require('nock')
const BigApiClient = require('../../../lib/shopgate.bigapi.client')

describe('Shopgate BigAPI', () => {
  let subjectUnderTest
  const tokenHandlerStub = {}

  const baseUrl = 'shopgate.services'
  const serviceName = 'task-scheduler'
  const version = 'v1'
  const path = '/schedules/shopifyRenewCustomerAccessToken-'

  beforeEach(done => {
    subjectUnderTest = new BigApiClient('shopgate.services', tokenHandlerStub, 15000)
    done()
  })

  it('should schedule customer token renewal for an application and stage', async () => {
    const applicationId = 'shop-31134'
    const stage = 'development'
    const pipelineApiKey = 'abcdef123456'

    tokenHandlerStub.getToken = () => { return { token: 'abcdef123456' } }

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
