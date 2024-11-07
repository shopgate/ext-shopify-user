const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const ApiFactory = require('../../lib/ShopifyApiFactory')
const { mapCustomAttributes } = require('../../lib/mapper')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('User is not logged in.')
  }

  const newAddress = {
    address1: input.street1,
    address2: input.street2,
    city: input.city,
    firstName: input.firstName,
    lastName: input.lastName,
    province: input.province,
    zip: input.zipCode,
    country: input.country,
    ...mapCustomAttributes(input.customAttributes)
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

  return storefrontApi.customerAddressCreate(customerAccessToken.accessToken, newAddress)
}
