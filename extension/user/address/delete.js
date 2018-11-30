const Tools = require('../../lib/tools')
const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const InvalidCallError = require('../../models/Errors/InvalidCallError')
const AddressValidationError = require('../../models/Errors/AddressValidationError')
const ApiFactory = require('../../lib/shopify.api.factory')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('User is not logged in.')
  }

  /**
   * @param {Array} ids
   */
  function validateIds (ids) {
    if (!Array.isArray(ids) || ids.length === 0 || ids.includes('')) {
      throw new InvalidCallError()
    }
  }

  const { ids } = input
  validateIds(ids)

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessToken = await context.storage.user.get('customerAccessToken')

  let result = Promise.all(ids.map(id => {
    return storefrontApi.customerAddressDelete(customerAccessToken.accessToken, id)
  }))

  return result.then(result => {
    return { success: true }
  }).catch(errors => {
    errors.forEach(error => {
      throw new AddressValidationError(error.message)
    })
  })
}
