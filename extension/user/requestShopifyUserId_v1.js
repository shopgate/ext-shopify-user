const Shopify = require('../lib/shopify.api.js')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const Sleep = require('sleep')

function canFindUserByEmail (shopify, input) {
  shopify.findUserByEmail(input.login, (err, customerList) => {
    /**
     * Ensure the requested data to be available and no request error occurred.
     *
     * @typedef {Object} CustomerResponseElement
     * @property {number} id
     */
    if (err || !customerList || customerList.length < 1) {
      return false
    }

    return customerList[0].id.toString()
  })
}
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

  console.log('++++++++++++++')
  console.log('Strategy: ' + input.strategy)
  console.log('++++++++++++++')

  /*
   * In some cases Shopify is not fast enough after registration. Therefor we have to wait a moment here.
   * Especially if the user registers within the checkout process. In this case we try multiple times to fetch the
   * userId. If we're not able, the step will return a CustomerNotFoundError
   */
  const maxTryCount = 6

  for (let tryCount = 1; tryCount <= maxTryCount; tryCount++) {
    console.log(Date.now() + '##### - tryCount: ' + tryCount)
    const userId = canFindUserByEmail(shopify, input)

    if (userId) {
      console.log(Date.now() + '##### - userId found: ' + userId)
      return cb(null, {userId})
    }

    console.log(Date.now() + '##### - userId not found, going to sleep and try again')
    Sleep.msleep(2000)
  }

  // TODO implement context.log here
  cb(new CustomerNotFoundError())
}
