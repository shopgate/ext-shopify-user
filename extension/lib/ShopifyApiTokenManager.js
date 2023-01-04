const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const AdminApi = require('./shopify.api.admin')

module.exports = class {
  /**
   * @param {SDKContextEntityStorage} userStorage
   * @param {SDKContextEntityStorage} extensionStorage
   * @param {AdminApi} adminApi
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
   * @returns {Promise<string>}
   */
  async getStorefrontAccessToken () {
    let token = await this.extensionStorage.get('storefrontAccessToken')

    if (!token) {
      token = await this.adminApi.getStoreFrontAccessToken()
      await this.setStorefrontAccessToken(token)
    }

    return token
  }

  /**
   * @returns {Promise<string>}
   */
  async fetchStorefrontAccessToken () {
    return (await this.adminApi.getStoreFrontAccessToken()).access_token
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
    let customerAccessToken = await this.userStorage.get('customerAccessToken')
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
