const request = require('request-promise-native')

const decodeJwt = require('./decodeJwt')

const EXTENSION_VERSION = require('../package.json').version
const USER_AGENT = `@shopgate/shopify-user/${EXTENSION_VERSION}`

class ShopifyCustomerAccountsApi {
  /**
   * @param {string} shopId
   * @param apiVersion
   */
  constructor (shopId, apiVersion = '2025-01') {
    this.apiUrl = `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`
  }

  /**
   * @param {string} customerAccountApiAccessToken
   * @returns {Promise<StorefrontApiCustomerAccessToken>}
   */
  async getStorefrontApiCustomerAccessToken (customerAccountApiAccessToken) {
    const response = await request({
      method: 'post',
      url: this.apiUrl,
      headers: { Authorization: customerAccountApiAccessToken, 'User-Agent': USER_AGENT },
      body: {
        query: 'mutation storefrontCustomerAccessTokenCreate { storefrontCustomerAccessTokenCreate { customerAccessToken userErrors { field message } } }',
        variables: {}
      },
      json: true
    })

    const accessToken = (((response || {}).data || {}).storefrontCustomerAccessTokenCreate || {}).customerAccessToken
    if (!accessToken) throw new Error('Invalid response from Shopify Customer Account API when fetching Storefront API customer access token')

    const { exp } = (decodeJwt(accessToken).payload || {})
    if (!exp) throw new Error('Invalid iat/exp from Shopify Customer Account API when fetching Shopify Storefront API customer JWT')

    const expiresAt = new Date(exp * 1000).toISOString()

    return { expiresAt, accessToken }
  }

  /**
   * @param {string} customerAccountApiAccessToken
   * @returns {Promise<{ id: string, firstName: string?, lastName: string?, phoneNumber: { phoneNumber: string? }, emailAddress: { emailAddress: string? } }>}
   */
  async getCustomer (customerAccountApiAccessToken) {
    return request({
      method: 'post',
      url: this.apiUrl,
      headers: { Authorization: customerAccountApiAccessToken, 'User-Agent': USER_AGENT },
      body: {
        query: '{ customer { id firstName lastName phoneNumber { phoneNumber } emailAddress { emailAddress } } }',
        variables: {}
      },
      json: true
    })
  }
}

module.exports = ShopifyCustomerAccountsApi
