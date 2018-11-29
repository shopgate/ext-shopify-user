const Tools = require('../../lib/tools')
const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const AddressValidationError = require('../../models/Errors/AddressValidationError')
const ApiFactory = require('../../lib/shopify.api.factory')

/**
 * @typedef {Object} input
 * @property {string[]} tags
 *
 * @param {SDKContext} context
 * @param {ShopgateAddress} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('User is not logged in.')
  }

  if (!Tools.isEmpty(input.tags) && input.tags.includes('default')) {
    const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
    const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
    const customerAccessToken = await context.storage.user.get('customerAccessToken')
    return storefrontApi.customerDefaultAddressUpdate(customerAccessToken.accessToken, input.id).then(() => {
      return { success: true }
    }).catch(errors => {
      errors.forEach(error => {
        throw new AddressValidationError(error.message)
      })
    })
  } else {
    return { success: true }
  }
}
