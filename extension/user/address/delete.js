const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const InvalidCallError = require('../../models/Errors/InvalidCallError')
const AddressValidationError = require('../../models/Errors/AddressValidationError')
const ApiFactory = require('../../lib/shopify.api.factory')

/**
 * @typedef {Object} input
 * @property {string[]} ids
 *
 * @param {SDKContext} context
 * @param input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    throw new UnauthorizedError('User is not logged in.')
  }

  const { ids } = input

  if (!Array.isArray(ids) || ids.length === 0 || ids.includes('')) {
    throw new InvalidCallError()
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessToken = await context.storage.user.get('customerAccessToken')

  const result = Promise.all(ids.map(id => {
    return storefrontApi.customerAddressDelete(customerAccessToken.accessToken, id)
  }))

  return result.catch(errors => {
    errors.forEach(error => {
      throw new AddressValidationError(error.message)
    })
  })
}
