const AdminApi = require('./shopify.api.admin')
const StorefrontApi = require('./shopify.api.storefront')
const ShopifyLogger = require('./logger')

module.exports = class {
  /**
   * @param {Object} context The Shopgate Connect step context.
   * @returns {AdminApi}
   */
  static buildAdminApi (context) {
    const requestLogger = new ShopifyLogger(context.log)
    return new AdminApi(
      context.config.shopifyShopAlias,
      context.config.shopifyAccessToken,
      (requestOptions, response) => requestLogger.log(requestOptions, response)
    )
  }

  /**
   * @param {Object} context The Shopgate Connect step context.
   * @param {string} storefrontAccessToken
   */
  static buildStorefrontApi (context, storefrontAccessToken) {
    const requestLogger = new ShopifyLogger(context.log)
    return new StorefrontApi(
      context.config.shopifyShopAlias,
      storefrontAccessToken,
      context.log,
      (requestOptions, response) => requestLogger.log(requestOptions, response)
    )
  }
}
