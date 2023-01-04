const AdminApi = require('./shopify.api.admin')
const StorefrontApi = require('./shopify.api.storefront')
const ShopifyLogger = require('./logger')
const ShopifyApiTokenManager = require('./ShopifyApiTokenManager')
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
   * @param {ShopifyApiTokenManager?} tokenManager
   * @param {AdminApi?} adminApi
   * @returns {StorefrontApi}
   */
  static buildStorefrontApi (context, tokenManager = null, adminApi = null) {
    const requestLogger = new ShopifyLogger(context.log)
    if (!tokenManager) tokenManager = this.buildShopifyApiTokenManager(context, adminApi)

    return new StorefrontApi(
      ConfigHelper.getBaseUrl(context.config),
      tokenManager,
      context.log,
      (requestOptions, response) => requestLogger.log(requestOptions, response)
    )
  }

  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @param {AdminApi?} adminApi
   * @returns {ShopifyApiTokenManager}
   */
  static buildShopifyApiTokenManager (context, adminApi = null) {
    if (!adminApi) adminApi = this.buildAdminApi(context)

    return new ShopifyApiTokenManager(
      context.storage.user,
      context.storage.extension,
      adminApi,
      context.log,
      context.meta.userId
    )
  }
}
