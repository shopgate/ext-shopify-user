const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const SGShopifyApi = require('../lib/shopify.api.class')

/**
 * @param {SDKContext} context
 */
module.exports = async function (context) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('Unauthorized user')
  }

  const shopifyAddresses = await new SGShopifyApi(context).getAddresses(context.meta.userId)
  return {
    addresses: shopifyAddresses.map(address => ({
      id: address.id,
      street1: address.address1,
      street2: address.address2,
      city: address.city,
      firstName: address.first_name,
      lastName: address.last_name,
      province: address.province,
      provinceCode: address.province_code,
      zipCode: address.zip,
      country: address.country,
      countryCode: address.country_code,
      customAttributes: {
        company: address.company,
        phone: address.phone,
      },
      ...(address.default === true && {tags: ['default']}),
      ...(address.default === false && {tags: []})
    }))
  }
}
