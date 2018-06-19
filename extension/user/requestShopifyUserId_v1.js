const SGShopifyApi = require('../lib/shopify.api.class.js')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')

function findUserByEmail (email, shopify, context) {
  return new Promise((resolve, reject) => {
    shopify.findUserByEmail(email, (err, customerList) => {
      /**
       * log undefined customer list from shopify Api
       */
      if (customerList === 'undefined') {
        context.log.error(new CustomerNotFoundError(), 'undefined customer list from shopify Api')
      }
      /**
       * Ensure the requested data to be available and no request error occurred.
       *
       * @typedef {Object} CustomerResponseElement
       * @property {number} id
       */
      if (err || !customerList || customerList.length < 1 || !customerList[0].id) {
        return reject(new CustomerNotFoundError())
      }

      return resolve(customerList[0].id.toString())
    })
  })
}

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

  // Default login via login form
  if (input.strategy === 'basic') {
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

      const filterResult = (customerList.filter((customer) => {
        return customer.email === input.login.toString()
      }))

      return filterResult.length
        ? cb(null, { 'userId': filterResult[0].id.toString() })
        : cb(new CustomerNotFoundError())
    })
  } else {
    // Forced login after customer has registered, for example within the checkout process
    return findUserByEmail(input.login, shopify, context).then((userId) => {
      return cb(null, { userId })
    }).catch((error) => {
      return cb(error)
    })
  }
}
