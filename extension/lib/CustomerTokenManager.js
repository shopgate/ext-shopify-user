const UnauthorizedError = require('../models/Errors/UnauthorizedError')

module.exports = class {
  /**
   * @param {SDKContext} context
   */
  constructor (context) {
    this.userStorage = context.storage.user
    this.extensionStorage = context.storage.extension
    this.log = context.log
    this.userId = context.meta.userId
  }

  /**
   * @returns {Promise.<string>}
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
        if (Date.parse(renewedToken.expiresAt) > Date.parse(customerAccessToken.expiresAt)) {
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
}
