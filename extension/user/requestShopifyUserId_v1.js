const ApiFactory = require('../lib/shopify.api.factory')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')

/**
 * @typedef {Object} ShopifyCustomerAccessToken
 * @property {string} accessToken
 * @property {string} expiresAt
 *
 * @typedef {Object} input
 * @property {string} login
 * @property {string} password
 *
 * @typedef {Object} RequestShopifyUserIdInputData
 * @property {ShopifyCustomerAccessToken} customerAccessToken
 * @property {string} storefrontAccessToken
 * @property {string} login
 *
 * @param {Object} context
 * @param {RequestShopifyUserIdInputData} input
 */
module.exports = async function (context, input) {
  const customerId = input.login.parameters.customerId

  if (input.strategy === 'web') {
    if (!customerId) {
      context.log.error('No userId given on input strategy web')
      throw new CustomerNotFoundError()
    } else {
      return { userId: customerId.toString() }
    }
  }

  const storefrontApi = ApiFactory.buildStorefrontApi(context, input.storefrontAccessToken)
  const userId = Buffer.from(
    (await storefrontApi.getCustomerByAccessToken(input.customerAccessToken.accessToken)).id,
    'base64')
    .toString()
    .substring(23) // strip 'gid://shopify/Customer/'

  return { userId }
}
