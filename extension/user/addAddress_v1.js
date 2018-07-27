const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const SGShopifyApi = require('../lib/shopify.api.class.js')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = async function (context, input, cb) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    return cb(new UnauthorizedError('User is not logged in.'))
  }

  const userId = context.meta.userId

  if (Tools.isEmpty(input.address)) {
    return cb(InvalidCallError('No or empty address data.'))
  }

  // Map the input address values to fit the shopify specifications for the admin api endpoint
  const address = Object.assign(input.address)
  const newAddress = {
    address: {
      address1: address.street1,
      address2: address.street2,
      city: address.city,
      company: address.company,
      first_name: address.firstName,
      last_name: address.lastName,
      phone: address.phone,
      province: address.province,
      country: address.country,
      zip: address.zipCode,
      name: address.firstName + ' ' + address.lastName, // Not in use yet in the frontend
    }
  }

  const shopify = new SGShopifyApi(context)

  return shopify.addAddress(userId, newAddress)
}
