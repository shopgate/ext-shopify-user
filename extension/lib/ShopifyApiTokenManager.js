const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const UnknownError = require('../models/Errors/UnknownError')

module.exports = class ShopifyApiTokenManager {
  /**
   * @param {SDKContextEntityStorage} extensionStorage
   * @param {SDKContextEntityStorage} userStorage
   * @param {ShopifyAdminApi} adminApi
   * @param {ShopifyHeadlessAuthApi} headlessAuthApi
   * @param {SDKContextLog} logger
   */
  constructor (extensionStorage, userStorage, adminApi, headlessAuthApi, logger) {
    this.extensionStorage = extensionStorage
    this.userStorage = userStorage
    this.adminApi = adminApi
    this.headlessAuthApi = headlessAuthApi
    this.log = logger
    this.userStorageNames = ['shopifyCartId', 'customerAccessToken', 'customerAccountApiAccessToken', 'headlessAuthApiAccessToken', 'userData']
  }

  /**
   * Gets the COMMON Storefront API access token for app access from either extension storage or Admin REST API.
   *
   * @param {boolean?} useCache
   * @param {string?} accessTokenTitle The title of the access token to be fetched from the Admin REST API.
   * @returns {Promise<string>}
   */
  async getStorefrontApiAccessToken (useCache = true, accessTokenTitle = 'Web Checkout Storefront Access Token') {
    let token

    if (useCache) token = await this.extensionStorage.get('storefrontAccessToken')

    if (!token) {
      token = await this.adminApi.getStoreFrontAccessToken(accessTokenTitle)
      await this.setStorefrontApiAccessToken(token)
    }

    return token
  }

  /**
   * Saves the COMMON Storefront API access token for app access to the extension storage
   *
   * @param {string} storefrontAccessToken
   * @returns {Promise<void>}
   */
  async setStorefrontApiAccessToken (storefrontAccessToken) {
    await this.extensionStorage.set('storefrontAccessToken', storefrontAccessToken)
  }

  /**
   * Gets a CUSTOMER scoped Storefront API access token from the user storage unless expired.
   *
   * @returns {Promise<StorefrontApiCustomerAccessToken>}
   * @throws UnauthorizedError
   */
  async getStorefrontApiCustomerAccessToken () {
    const customerAccessToken = await this.userStorage.get('customerAccessToken')
    if (!customerAccessToken || !customerAccessToken.accessToken) {
      this.log.debug('No Storefront API customer access token found in user storage')
      throw new UnauthorizedError('Please log in again.')
    }

    const now = Date.now()
    if (customerAccessToken.expiresAt && Date.parse(customerAccessToken.expiresAt) <= now) {
      this.log.info({ expiresAt: customerAccessToken.expiresAt }, 'Storefront API customer access token expired')
      throw new UnauthorizedError('Please log in again.')
    }

    return customerAccessToken
  }

  /**
   * Saves a CUSTOMER scoped Storefront API access token to the user storage.
   *
   * @param {StorefrontApiCustomerAccessToken} token
   */
  async setStorefrontApiCustomerAccessToken (token) {
    await this.userStorage.set('customerAccessToken', token)
  }

  async deleteStorefrontApiCustomerAccessToken () {
    await this.userStorage.del('customerAccessToken')
  }

  /**
   * Gets the Headless Auth API access token from the user storage or API if expired.
   *
   * This will use the refresh token internally to get a new access token if the current access token has expired.
   *
   * @returns {Promise<string|null>}
   */
  async getHeadlessAuthApiAccessToken () {
    const tokenData = await this.userStorage.get('headlessAuthApiAccessToken')

    if (!tokenData || !tokenData.accessToken) {
      this.log.debug('No Headless Auth API access token found in user storage')
      throw new UnauthorizedError('Please log in again.')
    }

    if (tokenData.expiresAt && Date.parse(tokenData.expiresAt) > Date.now()) {
      return tokenData
    }

    let newAccessToken
    try {
      newAccessToken = await this.headlessAuthApi.getAccessTokenByRefreshToken(tokenData.refreshToken)
    } catch (err) {
      // refresh token invalid/expired:
      if (err.statusCode === 400 && (err.error || {}).error === 'invalid_grant') {
        this.log.debug('Error getting a new Customer Account API access token due to an invalid/expired refresh token')

        await Promise.all(this.userStorageNames.map(setting => this.userStorage.del(setting)))
        throw new UnauthorizedError('Please log in again')
      }

      this.log.error(
        { errorMessage: err.message, code: err.code, statusCode: err.statusCode },
        'Error getting a new Customer Account API access token using a refresh token'
      )

      throw new UnknownError()
    }

    const headlessAuthApiAccessToken = {
      ...newAccessToken,
      idToken: tokenData.idToken // not returned when fetching access token via refresh token, so keep the existing one
    }

    await this.setHeadlessAuthApiAccessToken(headlessAuthApiAccessToken)

    return headlessAuthApiAccessToken.accessToken
  }

  /**
   * Gets the Headless Auth API ID token if present.
   *
   * @returns {Promise<string|null>}
   */
  async getHeadlessAuthApiIdToken () {
    const tokenData = await this.userStorage.get('headlessAuthApiAccessToken')

    return (tokenData || {}).idToken || null
  }

  /**
   * Saves the Headless Auth API access token, including a refresh and an ID token to the user storage.
   *
   * @param {HeadlessAuthApiAccessToken} token
   */
  async setHeadlessAuthApiAccessToken (token) {
    await this.userStorage.set('headlessAuthApiAccessToken', token)
  }

  async deleteHeadlessAuthApiAccessToken () {
    await this.userStorage.del('headlessAuthApiAccessToken')
  }

  /**
   * Gets the Customer Account API access token from user storage or Headless Auth API if it has expired.
   *
   * @returns {Promise<{accessToken: string, expiresAt: string}|{expiresAt}|{accessToken}|*>}
   */
  async getCustomerAccountApiAccessToken () {
    const tokenData = await this.userStorage.get('customerAccountApiAccessToken')

    if (!tokenData || !tokenData.accessToken) {
      this.log.debug('No Customer Account API access token found in user storage')
      throw new UnauthorizedError('Please log in again.')
    }

    if (tokenData.expiresAt && Date.parse(tokenData.expiresAt) > Date.now()) {
      return tokenData
    }

    const authAccessToken = await this.getHeadlessAuthApiAccessToken()
    const newToken = await this.headlessAuthApi.exchangeAccessToken(authAccessToken)

    await this.setCustomerAccountApiAccessToken(newToken)

    return newToken
  }

  /**
   * Saves the Customer Account API access token to the user storage.
   *
   * @param {CustomerAccountApiAccessToken} token
   */
  async setCustomerAccountApiAccessToken (token) {
    await this.userStorage.set('customerAccountApiAccessToken', token)
  }

  async deleteCustomerAccountApiAccessToken () {
    await this.userStorage.del('customerAccountApiAccessToken')
  }
}
