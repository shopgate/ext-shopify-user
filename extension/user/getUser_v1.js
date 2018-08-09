const Tools = require('../lib/tools')
const SGShopifyApi = require('../lib/shopify.api.class.js')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    return cb(new UnauthorizedError('Unauthorized user'))
  }

  // Look user storage first
  context.storage.user.get('userData', (err, storageData) => {
    if (storageData) {
      // check TTL for data if still valid
      if (storageData.ttl > (new Date()).getTime()) {
        return cb(null, storageData.user)
      }
    }
    if (err) {
      context.log.error(err, 'User storage error')
    }

    getUserFromShopify(context, (err, shopifyData) => {
      if (err) {
        return cb(err)
      }

      const storageData = {
        ttl: (new Date()).getTime() + context.config.userDataCacheTtl, // cache for N microseconds
        user: shopifyData
      }
      // Set userData silently
      context.storage.user.set('userData', storageData, (err) => {
        if (err) context.log.error(err, 'User storage error')
      })

      cb(null, shopifyData)
    })
  })
}

/**
 * @param {SDKContext} context
 * @param {function} cb
 */
function getUserFromShopify (context, cb) {
  const shopify = new SGShopifyApi(context)

  /**
   * @typedef {Object} CustomerAddress
   * @property {number} id
   * @property {string} first_name
   * @property {string} last_name
   * @property {string} company
   * @property {string} address1
   * @property {string} address2
   * @property {string} city
   * @property {string} country_code
   * @property {string} phone
   * @property {number} default
   * @property {number} zip
   * @property {string} country
   *
   * @typedef {Object} CustomerResponseElement
   * @property {number} id
   * @property {string} email
   * @property {string} first_name
   * @property {string} last_name
   * @property {string} phone
   *
   * @param {Error} err
   * @param {CustomerResponseElement} customerData
   */
  shopify.getCustomerById(context.meta.userId, (err, customerData) => {
    if (err) {
      return cb(new CustomerNotFoundError())
    }

    return cb(null, {
      'id': customerData.id.toString(),
      'firstName': customerData.first_name,
      'lastName': customerData.last_name,
      'mail': customerData.email,
      'phone': customerData.phone
    })
  })
}
