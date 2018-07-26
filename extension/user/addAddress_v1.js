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
    console.log('########## Not logged in ###############')
    return cb(new UnauthorizedError('User is not logged in.'))
  }

  const userId = context.meta.userId

  if (Tools.isEmpty(input.address)) {
    console.log('########## Invalid call ###############')
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
      province: null, // This field is not in use at the moment, but could be important later (e.g. for us shops)
      country: address.country,
      zip: address.zipcode,
      name: address.firstName + ' ' + address.lastName, // Not in use yet in the frontend
      province_code: null, // This field is not in use at the moment, but could be important later (e.g. for us shops)
      country_code: address.state,
      country_name: address.country // From Shopify API-Doc "The customer’s normalized country name.", not sure if we need this
    }
  }

  // TODO create new endpoint in shopify api class to post the data to the admin endpoint
  const shopify = new SGShopifyApi(context)

  return shopify.addAddress(userId, newAddress)
}
