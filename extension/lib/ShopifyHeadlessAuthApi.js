const request = require('request-promise-native')
const EXTENSION_VERSION = require('../package.json').version

const USER_AGENT = `@shopgate/shopify-user/${EXTENSION_VERSION}`
const CUSTOMER_ACCOUNT_API_AUDIENCE = '30243aa5-17c1-465a-8493-944bcc4e88aa'
const CUSTOMER_ACCOUNT_API_SCOPES = 'https://api.customers.com/auth/customer.graphql'

class ShopifyHeadlessAuthApi {
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

    this.apiUrl = `https://shopify.com/${shopId}/auth`
    this.basicAuthCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  }

  /**
   * @param {string} nonce
   * @param {string|null?} state
   * @param {string?} scopes
   * @returns {string}
   */
  buildCustomerAuthorizationRedirectUrl (nonce, state = null, scopes = CUSTOMER_ACCOUNT_API_SCOPES) {
    const url = new URL(`${this.apiUrl}/oauth/authorize`)
    url.searchParams.append('scope', `openid email ${scopes}`)
    url.searchParams.append('client_id', this.clientId)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('redirect_uri', this.redirectUri)
    url.searchParams.append('nonce', nonce)

    if (state) url.searchParams.append('state', state)

    return url.toString()
  }

  /**
   * @param {string?} idToken The ID token (JWT) that was passed along with the Headless Auth API access token.
   * @returns {string}
   */
  buildCustomerLogoutUrl (idToken) {
    const url = new URL(`${this.apiUrl}/logout`)
    if (idToken) url.searchParams.append('id_token_hint', idToken)

    return url.toString()
  }

  /**
   * @param {string} authorizationCode
   * @param {string} nonce
   * @returns {Promise<HeadlessAuthApiAccessToken>}
   */
  async getAccessTokenByAuthCode (authorizationCode, nonce) {
    const accessTokenResult = await request({
      method: 'POST',
      url: `${this.apiUrl}/oauth/token`,
      headers: { Authorization: `Basic ${this.basicAuthCredentials}`, 'User-Agent': USER_AGENT },
      form: {
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code: authorizationCode,
        nonce
      },
      json: true
    })

    return {
      accessToken: accessTokenResult.access_token,
      expiresAt: new Date(Date.now() + accessTokenResult.expires_in * 1000).toISOString(),
      refreshToken: accessTokenResult.refresh_token,
      idToken: accessTokenResult.id_token
    }
  }

  /**
   * @param {string} refreshToken
   * @returns {Promise<HeadlessAuthApiAccessToken>}
   * @throws Error on any request error
   */
  async getAccessTokenByRefreshToken (refreshToken) {
    const accessTokenResult = await request({
      method: 'POST',
      url: `${this.apiUrl}/oauth/token`,
      headers: { Authorization: `Basic ${this.basicAuthCredentials}`, 'User-Agent': USER_AGENT },
      form: {
        grant_type: 'refresh_token',
        redirect_uri: this.redirectUri,
        refresh_token: refreshToken
      },
      json: true
    })

    return {
      accessToken: accessTokenResult.access_token,
      refreshToken: accessTokenResult.refresh_token,
      expiresAt: new Date(Date.now() + accessTokenResult.expires_in * 1000).toISOString()
    }
  }

  /**
   * @param {string} accessToken
   * @param {string?} audience
   * @param {string?} scopes
   * @returns {Promise<{ accessToken: string, expiresAt: string }>}
   */
  async exchangeAccessToken (accessToken, audience = CUSTOMER_ACCOUNT_API_AUDIENCE, scopes = CUSTOMER_ACCOUNT_API_SCOPES) {
    const tokenData = await request({
      method: 'post',
      url: `${this.apiUrl}/oauth/token`,
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

    return {
      accessToken: tokenData.access_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }
  }
}

module.exports = ShopifyHeadlessAuthApi
