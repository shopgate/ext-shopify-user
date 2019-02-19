const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const AddressValidationError = require('../../models/Errors/AddressValidationError')
const ApiFactory = require('../../lib/shopify.api.factory')

/**
 * @typedef {Object} input
 * @property {string[]} tags - address tag list, e.g if the address is 'default'
 * @property {string} id - id of Shopify address to update
 *
 * @param {SDKContext} context
 * @param input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    throw new UnauthorizedError('User is not logged in.')
  }

  if (input.tags && input.tags.includes('default')) {
    const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
    const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
    const customerAccessToken = await context.storage.user.get('customerAccessToken')
    try {
      return await storefrontApi.customerDefaultAddressUpdate(customerAccessToken.accessToken, input.id)
    } catch (errors) {
      errors.forEach(error => {
        throw new AddressValidationError(error.message)
      })
    }
  }
}
