const errors = require('request-promise-native/errors')

module.exports = class {
  /**
   * @param {ExternalBigAPI} bigapiClient
   */
  constructor (bigapiClient) {
    this.bigapiClient = bigapiClient
  }

  /**
   * @param {string} stage
   * @param {string} applicationId
   * @param {string} pipelineApiKey
   * @returns {Promise<void>}
   * @throws Error when requesting the Big API fails.
   */
  async scheduleCustomerTokenRenew (stage, applicationId, pipelineApiKey) {
    await this.request(
      'task-scheduler',
      'v1',
      `/schedules/shopifyRenewCustomerAccessToken-${applicationId}`,
      'PUT',
      {
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
      }
    )
  }

  /**
   * @param {string} serviceName
   * @param {string} version
   * @param {string} path
   * @param {string} method
   * @param {Object} body
   * @returns {Promise<Object>}
   * @throws Error when requesting the Big API fails.
   */
  async request (serviceName, version, path, method, body = {}) {
    try {
      return this.bigapiClient.request({
        service: serviceName.toLowerCase(),
        version: '/' + version.replace(/^\/*/, ''),
        path,
        method,
        body
      })
    } catch (err) {
      if (err instanceof errors.StatusCodeError) {
        throw new Error(`Error in BigAPI requesting service ${serviceName} ${method} ${version + path}. HTTP-Code: ${err.statusCode}`)
      }
      throw err
    }
  }
}
