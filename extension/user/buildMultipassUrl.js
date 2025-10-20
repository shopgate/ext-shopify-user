const shopifyMultipass = require('../lib/shopifyMultipass')
const { getBaseUrl } = require('../helper/config')

/**
 * @param {SDKContext} context
 * @param {{ sgxsMeta: SgxsMeta, rawUrl: string }} input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId || !context.config.shopifyMultipassToken) return { url: input.rawUrl }

  const baseUrl = getBaseUrl(context.config)
  const { config: { shopifyMultipassToken } } = context
  const { rawUrl } = input
  const { user: { mail } } = await context.storage.user.get('userData')
  const buyerIp = input.sgxsMeta.deviceIp

  const url = shopifyMultipass(baseUrl, shopifyMultipassToken, mail, buyerIp, rawUrl)

  return { url }
}
