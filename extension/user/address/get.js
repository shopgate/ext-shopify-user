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

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
  const customerAccessToken = tokenManager.getCustomerAccessToken()

  const result = await storefrontApi.customerAddressesGet(customerAccessToken.accessToken)
  if (!result || !result.customer || !result.customer.addresses) throw new UnauthorizedError('Unauthorized user')

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
