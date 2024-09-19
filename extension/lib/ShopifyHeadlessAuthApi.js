const request = require('request-promise-native')
const EXTENSION_VERSION = require('../package.json').version

const REDIRECT_URI_SUCCESSFUL_LOGIN = '.../loggedIn'
const USER_AGENT = `@shopgate/shopify-user/${EXTENSION_VERSION}`
const CUSTOMER_ACCOUNT_API_AUDIENCE = '30243aa5-17c1-465a-8493-944bcc4e88aa'
const CUSTOMER_ACCOUNT_API_SCOPES = 'https://api.customers.com/auth/customer.graphql'

class ShopifyHeadlessApi {
  /**
   * @param {string} shopId
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {string} redirectUri
   * @param {string?} userAgent
   */
  constructor (shopId, clientId, clientSecret, redirectUri, userAgent = USER_AGENT) {
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.userAgent = userAgent || USER_AGENT

    this.apiUrl = `https://shopify.com/${shopId}/auth/oauth`
    this.basicAuthCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  }

  /**
   * @param {string} nonce
   * @param {string|null?} state
   * @param {string?} scopes
   * @returns {string}
   */
  buildCustomerAuthorizationRedirectUrl (nonce, state = null, scopes = CUSTOMER_ACCOUNT_API_SCOPES) {
    const url = new URL(`${this.apiUrl}/authorize`)
    url.searchParams.append('scope', `openid email ${scopes}`)
    url.searchParams.append('client_id', this.clientId)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('redirect_uri', this.redirectUri)
    url.searchParams.append('nonce', nonce)

    if (state) url.searchParams.append('state', state)

    return url.toString()
  }

  /**
   * @param {string} authorizationCode
   * @param {string} nonce
   * @returns {Promise<{ token_type: string, access_token: string, expires_in: number, refresh_token: string, scope: string }>}
   */
  async getAccessTokenByAuthCode (authorizationCode, nonce) {
    return request({
      method: 'POST',
      url: `${this.apiUrl}/token`,
      headers: { Authorization: `Basic ${this.basicAuthCredentials}`, 'User-Agent': USER_AGENT },
      form: {
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code: authorizationCode,
        nonce
      },
      json: true
    })
  }

  /**
   * @param {string} accessToken
   * @param {string?} audience
   * @param {string?} scopes
   * @returns {Promise<{ access_token: string }>}
   */
  async exchangeAccessToken (accessToken, audience = CUSTOMER_ACCOUNT_API_AUDIENCE, scopes = CUSTOMER_ACCOUNT_API_SCOPES) {
    return request({
      method: 'post',
      url: `${this.apiUrl}/token`,
      headers: { Authorization: `Basic ${this.basicAuthCredentials}`, 'User-Agent': this.userAgent },
      form: {
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        audience: CUSTOMER_ACCOUNT_API_AUDIENCE,
        subject_token: accessToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        scopes: scopes
      },
      json: true
    })
  }
}

module.exports = ShopifyHeadlessApi
