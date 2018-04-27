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

  shopify.findUserByEmail(input.login, (err, customerList) => {
    /**
     * Ensure the requested data to be available and no request error occurred.
     *
     * @typedef {Object} CustomerResponseElement
     * @property {number} id
     */
    if (err || !customerList || customerList.length < 1) {
      return cb(new CustomerNotFoundError())
    }

    // Check if we really got the correct user here
    for (let customer of customerList) {
      if (input.login.toString() === customer.email) {
        return cb(null, {userId: customer.id.toString()})
      }
    }

    return cb(new CustomerNotFoundError())
  })
}
