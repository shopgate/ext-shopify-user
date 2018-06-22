const SGShopifyApi = require('../lib/shopify.api.class.js')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')

/**
 * @typedef {Object} ShopifyCustomerAccessToken
 * @property {string} accessToken
 * @property {string} expiresAt
 *
 * @typedef {Object} input
 * @property {string} login
 * @property {string} password
 *
 * @typedef {Object} RequestShopifyUserIdInputData
 * @property {ShopifyCustomerAccessToken} customerAccessToken
 * @property {string} storefrontAccessToken
 * @property {string} login
 *
 * @param {Object} context
 * @param {RequestShopifyUserIdInputData} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const shopify = new SGShopifyApi(context)
  const login = input.login.login
  const customerId = input.login.parameters.customerId

  if (input.strategy === 'web') {
    if (!customerId) {
      context.log.error('No userId given on input strategy web')
      return cb(new CustomerNotFoundError())
    } else {
      return cb(null, { userId: customerId.toString() })
    }
  }

  shopify.findUserByEmail(login, (err, customerList) => {
    /**
     * Ensure the requested data to be available and no request error occurred.
     *
     * @typedef {Object} CustomerResponseElement
     * @property {number} id
     */
    if (err || !customerList || customerList.length !== 1) {
      if (customerList.length !== 1) {
        context.log.error('Multiple users accounts returned from API request')
      }
      return cb(new CustomerNotFoundError())
    }

    const filterResult = (customerList.filter((customer) => {
      return customer.email === login.toString()
    }))

    return filterResult.length
      ? cb(null, { 'userId': filterResult[0].id.toString() })
      : cb(new CustomerNotFoundError())
  })
}
