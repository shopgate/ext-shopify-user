const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const SGShopifyApi = require('../lib/shopify.api.class')
const { mapCountry, mapProvince, mapCustomAttributes } = require('../lib/mapper')
const _ = require('lodash')

/**
 * @param {SDKContext} context
 * @param {ShopgateAddress} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('User is not logged in.')
  }

  const address = createAddressUpdate(input)

  return new SGShopifyApi(context).updateAddress(context.meta.userId, address, (!Tools.isEmpty(input.tags) && input.tags.includes('default')))
}

/**
 * Map the input address values to fit the Shopify specifications for the admin api endpoint
 * @param {ShopgateAddress} input
 * @returns {Object}
 */
function createAddressUpdate (input) {
  const newAddress = {
    id: input.id,
    address1: input.street1,
    address2: input.street2,
    city: input.city,
    first_name: input.firstName,
    last_name: input.lastName,
    zip: input.zipCode,
    ...mapProvince(input.province),
    ...mapCountry(input.country),
    ...mapCustomAttributes(input.customAttributes),
    tags: input.tags
  }

  // Remove all empty or not set properties
  return _.omitBy(newAddress, _.isNil)
}
