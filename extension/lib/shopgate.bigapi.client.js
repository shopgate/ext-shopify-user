const requestp = require('request-promise-native')
const errors = require('request-promise-native/errors')

module.exports = class {
  /**
   * @param {string} baseDomain
   * @param {Object} tokenHandler
   * @param {number} timeout
   */
  constructor (baseDomain, tokenHandler, timeout) {
    this.baseDomain = baseDomain
    this.tokenHandler = tokenHandler
    this.timeout = timeout
    this.token = null
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
      'PUT',
      `/v1/schedules/shopifyRenewCustomerAccessToken-${applicationId}`,
      '',
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
            pipelineApiKey: pipelineApiKey
          }
        },
        cronPattern: `0 0 0 * * *`,
        queue: 'shopifyRenewCustomerAccessTokens'
      }
    )
  }

  /**
   * @param {string} serviceName
   * @param {string} method
   * @param {string} endpoint
   * @param {string} query
   * @param {Object} body
   * @param {boolean} retry
   * @returns {Promise<Object>}
   * @throws Error when requesting the Big API fails.
   */
  async request (serviceName, method, endpoint, query = '', body = {}, retry = true) {
    const uri = `https://${serviceName}.${this.baseDomain}${endpoint}${!query ? '' : `?${query}`}`
    this.token = await this.tokenHandler.getToken()

    try {
      return requestp({
        method,
        uri,
        headers: { authorization: `Bearer ${this.token}` },
        body,
        json: true,
        timeout: this.timeout,
        resolveWithFullResponse: true
      })
    } catch (err) {
      if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
        const error = new Error(`Timeout on BigAPI request ${method} ${uri}.`)
        error.code = 'ETIMEOUT'
        throw error
      }

      if (err instanceof errors.StatusCodeError) {
        if (err.statusCode === 403 && retry) {
          try {
            await this.tokenHandler.invalidateCurrentToken()
            await this.request(serviceName, method, endpoint, query, body, false)
          } catch (retryError) {
            throw new Error(`Error on BigAPI request ${method} ${uri} after retry due to invalid authorization. Original message: ${retryError.message}`)
          }
        }
        throw new Error(`Error on BigAPI request ${method} ${uri}. HTTP-Code: ${err.statusCode}`)
      }

      throw new Error(`Unknown error on BigAPI request ${method} ${uri}. Original message: ${err.message}`)
    }
  }
}
