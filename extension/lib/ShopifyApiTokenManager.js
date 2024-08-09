const UnauthorizedError = require('../models/Errors/UnauthorizedError')

module.exports = class ShopifyApiTokenManager {
  /**
   * @param {SDKContextEntityStorage} userStorage
   * @param {SDKContextEntityStorage} extensionStorage
   * @param {ShopifyAdminApi} adminApi
   * @param {SDKContextLog} logger
   * @param {string} userId
   */
  constructor (userStorage, extensionStorage, adminApi, logger, userId) {
    this.userStorage = userStorage
    this.extensionStorage = extensionStorage
    this.adminApi = adminApi
    this.log = logger
    this.userId = userId
  }

  /**
   * @param {boolean?} useCache
   * @param {string?} accessTokenTitle The title of the access token to be fetched from the Admin REST API.
   * @returns {Promise<string>}
   */
  async getStorefrontApiAccessToken (useCache = true, accessTokenTitle = 'Web Checkout Storefront Access Token') {
    let token

    if (useCache) token = await this.extensionStorage.get('storefrontAccessToken')

    if (!token) {
      token = await this.adminApi.getStoreFrontAccessToken(accessTokenTitle)
      await this.setStorefrontAccessToken(token)
    }

    return token
  }

  /**
   * @param {string} storefrontAccessToken
   * @returns {Promise<void>}
   */
  async setStorefrontAccessToken (storefrontAccessToken) {
    await this.extensionStorage.set('storefrontAccessToken', storefrontAccessToken)
  }

  /**
   * @returns {Promise<string>}
   * @throws UnauthorizedError
   */
  async getCustomerAccessToken () {
    const customerAccessToken = await this.userStorage.get('customerAccessToken')
    if (!customerAccessToken || !customerAccessToken.accessToken) {
      throw new UnauthorizedError('Please log in again.')
    }

    const now = Date.now()
    if (customerAccessToken.expiresAt && Date.parse(customerAccessToken.expiresAt) <= now) {
      this.log.error({
        expiresAt: customerAccessToken.expiresAt,
        userId: this.userId
      }, 'Customer access token expired')

      throw new UnauthorizedError('Please log in again.')
    }

    return customerAccessToken
  }

  /**
   * @param {ShopifyCustomerAccessToken} token
   */
  async setCustomerAccessToken (token) {
    await this.userStorage.set('customerAccessToken', token)
  }
}
