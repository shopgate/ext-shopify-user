const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const { mapCustomAttributes } = require('../../lib/mapper')
const _ = {
  omitBy: require('lodash/omitBy'),
  isNil: require('lodash/isNil')
}
const ApiFactory = require('../../lib/ShopifyApiFactory')

/**
 * @typedef {Object} input
 * @property {string} id - id of Shopify address to update
 *
 * @param {SDKContext} context
 * @param input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('User is not logged in.')
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

  return storefrontApi.customerAddressUpdate(customerAccessToken.accessToken, input.id, createAddressUpdate(input))

  /**
   * Map the input address values to fit the Shopify specifications for the api endpoint
   * @param {ShopgateAddress} input
   * @returns {ShopifyAddress}
   */
  function createAddressUpdate (input) {
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

    // Remove all empty or not set properties
    return _.omitBy(newAddress, _.isNil)
  }
}
