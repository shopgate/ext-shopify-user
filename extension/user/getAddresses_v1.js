const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const SGShopifyApi = require('../lib/shopify.api.class')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = async function (context, input, cb) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged in
  if (Tools.isEmpty(context.meta.userId)) {
    context.log.error('User is not logged in')
    return cb(new UnauthorizedError('Unauthorized user'))
  }

  const shopify = new SGShopifyApi(context)

  return shopify.getAddresses(context.meta.userId)
}
