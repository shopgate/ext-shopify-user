const Shopify = require('../lib/shopify.api.js')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const Sleep = require('sleep')

/**
 * @typedef {Object} ShopifyCustomerAccessToken
 * @property {string} accessToken
 * @property {string} expiresAt
 *
 * @typedef {Object} LoginParams
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
  const shopify = Shopify(context.config)

  /*
   * In some cases Shopify is not fast enough after registration. Therefor we have to wait a moment here.
   * Especially if the user registers within the checkout process.
   */
  Sleep.msleep(1000)
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

    const userId = customerList[0].id.toString()
    cb(null, {userId})
  })
}
