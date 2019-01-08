class ShopifyCustomer {
  constructor (storefrontApi) {
    this.storefrontApi = storefrontApi
  }

  async getAccessToken (login, password) {
    return this.storefrontApi.getCustomerAccessToken(login, password)
  }

  async getIdByToken (customerAccessToken) {
    return  Buffer.from(
      (await storefrontApi.getCustomerByAccessToken(customerAccessToken.accessToken)).id,
      'base64')
      .toString()
      .substring(23) // strip 'gid://shopify/Customer/'
  }
}

module.exports = ShopifyCustomer
