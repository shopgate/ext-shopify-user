const Tools = require('../lib/tools')
const Shopify = require('../lib/shopify.api.js')
const User = require('../models/user/user')
const Address = require('../models/user/address')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @typedef {Object} SDKContext
 * @property {Object} meta
 *
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const shopify = Shopify(context.config)

  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    return cb(new UnauthorizedError('User is not logged in.'))
  }

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
   */
  /**
   * @typedef {Object} CustomerResponseElement
   * @property {number} id
   * @property {string} email
   * @property {string} first_name
   * @property {string} last_name
   * @property {string} phone
   * @property {[CustomerAddress]} addresses
   */
  /**
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
      const customerAddress = new Address()
      customerAddress.id = address.id
      // There is no field 'type' within shopify-response
      customerAddress.type = null
      customerAddress.firstName = address.first_name
      customerAddress.lastName = address.last_name
      customerAddress.company = address.company
      customerAddress.street1 = address.address1
      customerAddress.street2 = address.address2
      customerAddress.city = address.city
      customerAddress.state = address.country_code
      customerAddress.phone = address.phone
      customerAddress.isDefault = address.default
      // There is no field 'alias' within shopify-respone
      customerAddress.alias = null
      customerAddress.zipcode = address.zip
      customerAddress.country = address.country

      user.addresses.push(customerAddress.toJSON())
    })

    cb(null, {
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
