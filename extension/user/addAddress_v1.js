const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const SGShopifyApi = require('../lib/shopify.api.class')
const {mapCountry, mapCustomAttributes} = require('../lib/mapper')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('User is not logged in.')
  }

  if (Tools.isEmpty(input.address)) {
    throw new InvalidCallError('Empty address data.')
  }

  // Map the input address values to fit the Shopify specifications for the admin api endpoint
  const address = Object.assign(input.address)
  /** @var {ShopifyAddress} newAddress */
  const newAddress = {
    address1: address.street1,
    address2: address.street2,
    city: address.city,
    first_name: address.firstName,
    last_name: address.lastName,
    province_code: address.province,
    zip: address.zipCode,
    name: address.firstName + ' ' + address.lastName,
    ...mapCountry(address.country),
    ...mapCustomAttributes(address.customAttributes)
  }

  return new SGShopifyApi(context).addAddress(context.meta.userId, newAddress, (!Tools.isEmpty(input.address.tags) && input.address.tags.includes('default')))
}
