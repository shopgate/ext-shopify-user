const requestp = require('request-promise-native')
const errors = require('request-promise-native/errors')

module.exports = class {
  /**
   * @param {SDKContext.storage.extension} storage A storage instance with methods get(key) and set(key, value)
   * @param {SDKContext.config.credentials} credentials
   * @param {number} timeout
   * @param {string} tokenIdentifier
   */
  constructor (storage, credentials, timeout, tokenIdentifier = 'bigapi_access_token') {
    this.storage = storage
    this.credentials = credentials
    this.timeout = timeout
    this.tokenIdentifier = tokenIdentifier
    this.currentToken = null
  }

  /**
   * @returns {Promise<string>}
   * @throws Error when querying the storage fails or fetching the token from BigAPI fails.
   */
  async getToken () {
    if (!this.currentToken) this.currentToken = await this.storage.get(this.tokenIdentifier)
    if (!this.currentToken || (this.currentToken.expiresAt - 60000) < Date.now()) this.currentToken = await this.getNewToken()

    return this.currentToken
  }

  /**
   * @returns {Promise<void>}
   * @throws Error when deleting the current token from the storage fails.
   */
  async invalidateCurrentToken () {
    await this.storage.del(this.tokenIdentifier)
    this.currentToken = null
  }

  /**
   * @returns {Promise<{token: string, expiresAt: number, baseDomain: string}>}
   * @throws Error when fetching the token from BigAPI fails.
   */
  async getNewToken () {
    /**
     * @typedef {Object} response
     * @property {number} statusCode
     * @property {Object} body
     * @property {string} body.access_token
     * @property {number} body.expires_in
     */
    let response

    // for logging:
    const method = 'POST'
    const uri = `https://api.${this.credentials.baseDomain}/oauth/token`

    try {
      response = await requestp({
        method,
        uri,
        headers: {
          authorization: `Basic ${Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64')}`
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: this.credentials.refreshToken
        },
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

      if (err instanceof errors.StatusCodeError) throw new Error(`Error on BigAPI request  ${method} ${uri}. HTTP-Code: ${err.statusCode}`)

      throw new Error(`Unknown error on BigAPI request  ${method} ${uri}.`)
    }

    return {
      token: response.body.access_token,
      expiresAt: Date.now() + response.body.expires_in * 1000,
      baseDomain: this.credentials.baseDomain
    }
  }
}
