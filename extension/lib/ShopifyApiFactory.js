const ShopifyAdminApi = require('./ShopifyAdminApi')
const ShopifyStorefrontApi = require('./ShopifyStorefrontApi')
const ShopifyCustomerAccountsApi = require('./ShopifyCustomerAccountsApi')
const ShopifyHeadlessAuthApi = require('./ShopifyHeadlessAuthApi')
const ShopifyLogger = require('./logger')
const ShopifyApiTokenManager = require('./ShopifyApiTokenManager')
const ConfigHelper = require('../helper/config')

/* semi-singletons */
let storefrontApi

module.exports = class {
  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @returns {ShopifyAdminApi}
   */
  static buildAdminApi (context) {
    const requestLogger = new ShopifyLogger(context.log)
    return new ShopifyAdminApi(
      ConfigHelper.getBaseUrl(context.config),
      context.config.shopifyAccessToken,
      (requestOptions, response) => requestLogger.log(requestOptions, response)
    )
  }

  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @param {ShopifyApiTokenManager?} tokenManager
   * @param {{ sessionId: string, deviceIp: string }} sgxsMeta
   * @param {ShopifyAdminApi?} adminApi
   * @returns {ShopifyStorefrontApi}
   */
  static buildStorefrontApi (context, sgxsMeta, tokenManager = null, adminApi = null) {
    const { deviceIp } = sgxsMeta || {}

    if (storefrontApi) return storefrontApi

    const requestLogger = new ShopifyLogger(context.log)
    if (!tokenManager) tokenManager = this.buildShopifyApiTokenManager(context, adminApi)

    storefrontApi = new ShopifyStorefrontApi(
      ConfigHelper.getBaseUrl(context.config),
      tokenManager,
      deviceIp,
      context.log,
      (requestOptions, response) => requestLogger.log(requestOptions, response)
    )

    return storefrontApi
  }

  static buildHeadlessAuthApi (context, userAgent = undefined) {
    const clientId = context.config.shopifyHeadlessApiClientId
    const clientSecret = context.config.shopifyHeadlessApiClientSecret

    return new ShopifyHeadlessAuthApi(
      context.config.shopifyShopId,
      clientId,
      clientSecret,
      context.config.shopifyHeadlessApiLoginRedirectUrl,
      userAgent
    )
  }

  static buildCustomerAccountApi (context) {
    return new ShopifyCustomerAccountsApi(context.config.shopifyShopId)
  }

  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @param {ShopifyAdminApi?} adminApi
   * @param {ShopifyHeadlessAuthApi?} headlessAuthApi
   * @returns {ShopifyApiTokenManager}
   */
  static buildShopifyApiTokenManager (context, adminApi = null, headlessAuthApi = null) {
    if (!adminApi) adminApi = this.buildAdminApi(context)
    if (!headlessAuthApi) headlessAuthApi = this.buildHeadlessAuthApi(context)

    return new ShopifyApiTokenManager(
      context.storage.extension,
      context.storage.user,
      adminApi,
      headlessAuthApi,
      context.log
    )
  }
}
