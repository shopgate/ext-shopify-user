const shopifyMultipass = require('../lib/shopifyMultipass')
const { getBaseUrl } = require('../helper/config')

/**
 * @param {SDKContext} context
 * @param {{ sgxsMeta: SgxsMeta, target: string }} input
 */
module.exports = async (context, input) => {
  const target = input.target.match(/https?:\/\//)
    ? input.target
    : getBaseUrl(context.config) + input.target

  if (!context.meta.userId || !context.config.shopifyMultipassToken) return { url: target }

  const baseUrl = getBaseUrl(context.config)
  const { config: { shopifyMultipassToken } } = context
  const { user: { mail } } = await context.storage.user.get('userData')
  const buyerIp = input.sgxsMeta.deviceIp

  const url = shopifyMultipass(baseUrl, shopifyMultipassToken, mail, buyerIp, target)

  return { url }
}
