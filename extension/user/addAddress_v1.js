const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const SGShopifyApi = require('../lib/shopify.api.class')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = async function (context, input, cb) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    context.log.error('User is not logged in')
    return cb(new UnauthorizedError('User is not logged in.'))
  }

  const userId = context.meta.userId

  if (Tools.isEmpty(input.address)) {
    context.log.error('Empty address data.')
    return cb(new InvalidCallError('Empty address data.'))
  }

  // Map the input address values to fit the Shopify specifications for the admin api endpoint
  const address = Object.assign(input.address)
  const newAddress = {
    address1: address.street1,
    address2: address.street2,
    city: address.city,
    company: address.company,
    first_name: address.firstName,
    last_name: address.lastName,
    phone: address.phone,
    province_code: address.province,
    zip: address.zipCode,
    name: address.firstName + ' ' + address.lastName,
    ...mapCountry(address.country)
  }

  const shopify = new SGShopifyApi(context)

  return shopify.addAddress(userId, newAddress)
}

/**
 * @param {string} [country] - country input
 *
 * @returns {Object}
 */
function mapCountry (country) {
  const map = country && {
    ...(country.length === 2 && {country_code: country}),
    ...(country.length > 2 && {country})
  }
  return map || {}
}
