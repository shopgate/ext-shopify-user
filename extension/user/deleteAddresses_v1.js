const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const SGShopifyApi = require('../lib/shopify.api.class')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('User is not logged in.')
  }

  if (Tools.isEmpty(input.ids)) {
    throw new InvalidCallError('No address ids given.')
  }

  if (input.ids.includes('')) {
    throw new InvalidCallError('Empty string address id passed.')
  }

  return new SGShopifyApi(context).deleteAddresses(context.meta.userId, input.ids)
}
