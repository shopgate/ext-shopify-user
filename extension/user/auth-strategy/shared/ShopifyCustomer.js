class ShopifyCustomer {
  constructor (storefrontApi, adminApi) {
    this.storefrontApi = storefrontApi
    this.adminApi = adminApi
  }

  async getAccessToken (login, password) {
    return this.storefrontApi.getCustomerAccessToken(login, password)
  }

  async getIdByToken (customerAccessToken) {
    return  Buffer.from(
      (await this.storefrontApi.getCustomerByAccessToken(customerAccessToken.accessToken)).id,
      'base64')
      .toString()
      .substring(23) // strip 'gid://shopify/Customer/'
  }

  /**
   * @param {string} email
   * @return {Promise<{email:string,id:string}>}
   */
  async findByEmail (email) {
    const { customers } = await this.adminApi.get('/admin/customers/search.json', `query=email:${encodeURIComponent(email)}&fields=email,id`)
    if (!customers) {
      throw new Error('Invalid data received from shopify')
    }

    if (customers.length === 0) {
      return null
    }

    if (customers.length > 1) {
      throw new Error('Unable to uniquely identify customer')
    }

    return customers[0]
  }
}

module.exports = ShopifyCustomer
