const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const SGShopifyApi = require('../lib/shopify.api.class')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async function (context) {
  if (Tools.isEmpty(context.meta.userId)) {
    return new UnauthorizedError('Unauthorized user')
  }

  const shopifyAddresses = await new SGShopifyApi(context).getAddresses(context.meta.userId)
  const addresses = []
  shopifyAddresses.forEach(address => {
    const customerAddress = {
      id: address.id,
      street1: address.address1,
      street2: address.address2,
      city: address.city,
      company: address.company,
      firstName: address.first_name,
      lastName: address.last_name,
      phone: address.phone,
      province: address.province,
      province_code: address.province_code,
      zipCode: address.zip,
      country: address.country,
      country_code: address.country_code,
      tags: []
    }

    if (address.default === true) {
      customerAddress.tags.push('default')
    }

    addresses.push(customerAddress)
  })

  return {addresses}
}
