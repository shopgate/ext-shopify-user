const ApiFactory = require('../../../lib/shopify.api.factory')

class ShopifyStorefront {
  constructor (context) {
    this.context = context
  }

  async getAccessToken () {
    let storefrontAccessToken = await this.context.storage.extension.get('storefrontAccessToken')
    if (!storefrontAccessToken) {
      const adminApi = ApiFactory.buildAdminApi(this.context)
      storefrontAccessToken = (await adminApi.getStoreFrontAccessToken()).access_token
      this.context.storage.extension.set('storefrontAccessToken', storefrontAccessToken)
    }

    return storefrontAccessToken
  }

  /**
   * @param {SDKContext} context
   * @return {ShopifyStorefront}
   */
  static create (context) {
    return new ShopifyStorefront(context)
  }
}

module.exports = ShopifyStorefront
