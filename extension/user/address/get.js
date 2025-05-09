const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const ApiFactory = require('../../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {{ sgxsMeta: SgxsMeta }} input
 *
 * @return {Promise<{addresses: ShopgateUserAddress[]}>}
 */
module.exports = async (context, { sgxsMeta }) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('Unauthorized user')
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, sgxsMeta, tokenManager)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

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
