const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const SGShopifyApi = require('../lib/shopify.api.class')
const orderBy = require('lodash/orderBy')

/**
 * @param {SDKContext} context
 */
module.exports = async function (context) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('Unauthorized user')
  }

  const shopifyAddressesOrderedByDefaultFirst = orderBy(
    await new SGShopifyApi(context).getAddresses(context.meta.userId), ['default'], ['desc']
  )

  return {
    addresses: shopifyAddressesOrderedByDefaultFirst.map(address => ({
      id: address.id,
      street1: address.address1,
      street2: address.address2,
      city: address.city,
      firstName: address.first_name,
      lastName: address.last_name,
      province: address.province_code,
      zipCode: address.zip,
      country: address.country_code,
      customAttributes: {
        company: address.company,
        phone: address.phone
      },
      ...(address.default === true && { tags: ['default'] }),
      ...(address.default === false && { tags: [] })
    }))
  }
}
