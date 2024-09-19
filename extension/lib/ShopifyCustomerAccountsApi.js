const request = require('request-promise-native')
const EXTENSION_VERSION = require('../package.json').version
const USER_AGENT = `@shopgate/shopify-user/${EXTENSION_VERSION}`

class ShopifyCustomerAccountsApi {
  constructor (shopId, apiVersion = '2024-07') {
    this.apiUrl = `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`
  }

  async getCustomerAccessToken (customerAccountAccessToken) {
    return request({
      method: 'post',
      url: this.apiUrl,
      headers: { Authorization: customerAccountAccessToken, 'User-Agent': USER_AGENT },
      body: {
        query: 'mutation storefrontCustomerAccessTokenCreate { storefrontCustomerAccessTokenCreate { customerAccessToken userErrors { field message } } }',
        variables: {}
      },
      json: true
    })
  }

  async getCustomer (customerAccountAccessToken) {
    return request({
      method: 'post',
      url: this.apiUrl,
      headers: { Authorization: customerAccountAccessToken, 'User-Agent': USER_AGENT },
      body: {
        query: '{ customer { id firstName lastName phoneNumber { phoneNumber } emailAddress { emailAddress } } }',
        variables: {}
      },
      json: true
    })
  }
}

module.exports = ShopifyCustomerAccountsApi
