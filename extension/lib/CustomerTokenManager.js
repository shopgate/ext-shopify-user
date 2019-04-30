const UnauthorizedError = require('../models/Errors/UnauthorizedError')

module.exports = class {
  /**
   * @param {SDKContextEntityStorage} userStorage
   * @param {SDKContextEntityStorage} extensionStorage
   * @param {SDKContextLog} logger
   * @param {string} userId
   */
  constructor (userStorage, extensionStorage, logger, userId) {
    this.userStorage = userStorage
    this.extensionStorage = extensionStorage
    this.log = logger
    this.userId = userId
  }

  /**
   * @returns {Promise<string>}
   * @throws UnauthorizedError
   */
  async getToken () {
    let customerAccessToken = await this.userStorage.get('customerAccessToken')
    if (!customerAccessToken || !customerAccessToken.accessToken) {
      throw new UnauthorizedError('Please log in again.')
    }

    const now = Date.now()
    if (customerAccessToken.expiresAt) {
      try {
        const renewedToken = await this.extensionStorage.map.getItem('customerTokensByUserIds', this.userId)
        if (renewedToken && Date.parse(renewedToken.expiresAt) > Date.parse(customerAccessToken.expiresAt)) {
          customerAccessToken = renewedToken
          await this.userStorage.set('customerAccessToken', renewedToken)
        }
      } catch (err) {
        this.log.error(err)
      }

      if (Date.parse(customerAccessToken.expiresAt) <= now) {
        throw new UnauthorizedError('Please log in again.')
      }
    }

    return customerAccessToken
  }

  /**
   * @param {ShopifyCustomerAccessToken} token
   */
  async setToken (token) {
    await this.userStorage.set('customerAccessToken', token)
    await this.extensionStorage.map.setItem('customerTokensByUserIds', this.userId, token)
  }
}
