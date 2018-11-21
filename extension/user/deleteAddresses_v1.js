const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const ApiFactory = require('../lib/shopify.api.factory')

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

  return ApiFactory.buildAdminApi(context).deleteAddresses(context.meta.userId, input.ids)
}
