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

  // Map the input address values to fit the Shopify specifications for the admin api endpoint
  /** @var {ShopifyAddress} newAddress */
  const newAddress = {
    address1: input.street1,
    address2: input.street2,
    city: input.city,
    first_name: input.firstName,
    last_name: input.lastName,
    province_code: input.province,
    zip: input.zipCode,
    name: input.firstName + ' ' + input.lastName,
    ...mapCountry(input.country),
    ...mapCustomAttributes(input.customAttributes)
  }

  return new SGShopifyApi(context).addAddress(context.meta.userId, newAddress)
}
