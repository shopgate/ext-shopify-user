const SGShopifyApi = require('../lib/shopify.api.class.js')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const Sleep = require('sleep')

function findUserByEmail(email, shopify) {
  shopify.findUserByEmail(email, (err, customerList) => {

    console.log('+++  CustomerList:')
    console.log(customerList)
    console.log('+++  +++ +++ +++ +++')

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

  console.log('++++++++++++++')
  console.log('Strategy: ' + input.strategy)
  console.log('++++++++++++++')

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
        ? cb(null, {'userId': filterResult[0].id.toString()})
        : cb(new CustomerNotFoundError())
    })
  } else {
    // Forced login after customer has registered, for example within the checkout process
    console.log('###  Forced login  ###')
    const maxTries = 5
    const sleepDelay = 2000

    for (let tryCount = 1; tryCount <= maxTries; tryCount++) {
      console.log('### - Login tryCount: ' + tryCount)
      const userId = findUserByEmail(input.login, shopify)
      if (userId) {
        console.log('!!!!!!!! user found')
        return cb(null, {userId})
      }
      Sleep.msleep(sleepDelay)
      console.log('###########################')
    }

    cb(new CustomerNotFoundError())
  }
}
