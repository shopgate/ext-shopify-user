const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const SGShopifyApi = require('../lib/shopify.api.class')

/**
 * @param {SDKContext} context
 * @param {ShopgateAddress} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('User is not logged in.')
  }

  if (!Tools.isEmpty(input.tags) && input.tags.includes('default')) {
    console.log('##############')
    console.log('UPDATING')
    console.log('##############')
    return new SGShopifyApi(context).setDefaultAddress(context.meta.userId, input.id)
  }

  return ({ success: true })
}
