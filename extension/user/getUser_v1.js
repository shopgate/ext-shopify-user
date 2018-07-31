const Tools = require('../lib/tools')
const SGShopifyApi = require('../lib/shopify.api.class.js')
const User = require('../models/user/user')
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
    return cb(new UnauthorizedError('User is not logged in.'))
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
   * @property {[CustomerAddress]} addresses
   *
   * @param {Error} err
   * @param {CustomerResponseElement} customerData
   */
  shopify.getCustomerById(context.meta.userId, (err, customerData) => {
    if (err) {
      return cb(new CustomerNotFoundError())
    }

    const user = new User()

    user.id = customerData.id
    user.mail = customerData.email
    user.firstName = customerData.first_name
    user.lastName = customerData.last_name
    user.phone = customerData.phone

    customerData.addresses.forEach((address) => {
      user.addresses.push({
        id: address.id,
        type: null,
        firstName: address.first_name,
        lastName: address.last_name,
        company: address.company,
        street1: address.address1,
        street2: address.address2,
        city: address.city,
        state: address.country_code,
        phone: address.phone,
        isDefault: address.default,
        alias: null,
        zipcode: address.zip,
        country: address.country
      })
    })

    return cb(null, {
      'id': user.id.toString(),
      'mail': user.mail,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'gender': user.gender,
      'birthday': user.birthday,
      'phone': user.phone,
      'customerGroups': user.customerGroups,
      'addresses': user.addresses
    })
  })
}
