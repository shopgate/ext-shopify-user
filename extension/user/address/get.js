const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const ApiFactory = require('../../lib/shopify.api.factory')

/**
 * @param {SDKContext} context
 *
 * @return {Promise<{addresses: ShopgateAddress[]}>}
 */
module.exports = async (context) => {
  if (!context.meta.userId) {
    throw new UnauthorizedError('Unauthorized user')
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessToken = await context.storage.user.get('customerAccessToken')

  const result = await storefrontApi.customerAddressesGet(customerAccessToken.accessToken)
  const { customer: { addresses: { edges: addressesItems } } } = result
  if (addressesItems.length === 0) {
    return { addresses: [] }
  }
  const { customer: { defaultAddress: { id: defaultAddressId } } } = result

  return {
    addresses: await addressesItems.map(item => structureAddress(item.node))
  }

  function structureAddress (address) {
    return {
      id: `${address.id}`,
      street1: address.address1,
      street2: address.address2,
      city: address.city,
      firstName: address.firstName,
      lastName: address.lastName,
      province: address.provinceCode,
      zipCode: address.zip,
      country: address.countryCodeV2,
      customAttributes: {
        company: address.company,
        phone: address.phone
      },
      tags: address.id === defaultAddressId ? ['default'] : []
    }
  }
}
