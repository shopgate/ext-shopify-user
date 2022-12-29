const AdminApi = require('./shopify.api.admin')
const StorefrontApi = require('./shopify.api.storefront')
const ShopifyLogger = require('./logger')
const CustomerTokenManager = require('./CustomerTokenManager')
const ConfigHelper = require('../helper/config')

module.exports = class {
  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @returns {AdminApi}
   */
  static buildAdminApi (context) {
    const requestLogger = new ShopifyLogger(context.log)
    return new AdminApi(
      ConfigHelper.getBaseUrl(context.config),
      context.config.shopifyAccessToken,
      (requestOptions, response) => requestLogger.log(requestOptions, response)
    )
  }

  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @param {string} storefrontAccessToken
   */
  static buildStorefrontApi (context, storefrontAccessToken) {
    const requestLogger = new ShopifyLogger(context.log)
    return new StorefrontApi(
      ConfigHelper.getBaseUrl(context.config),
      storefrontAccessToken,
      context.log,
      (requestOptions, response) => requestLogger.log(requestOptions, response),
      context
    )
  }

  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @returns {CustomerTokenManager}
   */
  static buildCustomerTokenManager (context) {
    return new CustomerTokenManager(
      context.storage.user,
      context.storage.extension,
      context.log,
      context.meta.userId
    )
  }
}
