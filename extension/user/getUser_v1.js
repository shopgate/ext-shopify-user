const Tools = require('../lib/tools')
const User = require('../models/user/user')
const Address = require('../models/user/address')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @typedef {object} context
 * @property {object} meta
 *
 * @param context
 * @param input
 * @param cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)

  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    return cb(new UnauthorizedError('User is not logged in.'))
  }

  const currentUserId = context.meta.userId
  const query = '?query=' + currentUserId

  Shopify.get('/admin/customers/search.json' + query, {}, function (err, data) {
    if (err) cb(err, null)

    if (Tools.isEmpty(data.customers)) {
      return cb(new Error('customer not found'))
    }

    /**
     * @typedef {object} customerData
     * @property {string} first_name
     * @property {string} last_name
     */
    const customerData = data.customers[0]
    const user = new User()

    user.id = customerData.id
    user.mail = customerData.email
    user.firstName = customerData.first_name
    user.lastName = customerData.last_name
    user.phone = customerData.phone

    /**
     * @typdef {object} address
     * @property {string} address1
     * @property {string} address2
     * @property {string} country_code
     * @property {string} zip
     */
    customerData.addresses.forEach(function (address) {
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
