const { getBaseUrl } = require('../helper/config')

/**
 * Returns the URLs of the Shopify web shop as configured in the extension config, e.g. for logging customers in and
 * out on the web shop. The custom shop domain and the myshopify.com URL based on the alias are returned separately, so
 * the frontend can decide about the precedence (e.g. in combination with legacy app settings).
 *
 * Doesn't require a logged in user.
 *
 * @param {SDKContext} context
 * @returns {Promise<{ shopDomain: string|null, aliasUrl: string|null }>}
 */
module.exports = async (context) => {
  const { shopifyShopDomain, shopifyShopAlias } = context.config || {}

  return {
    shopDomain: shopifyShopDomain ? getBaseUrl({ shopifyShopDomain }) : null,
    aliasUrl: shopifyShopAlias ? getBaseUrl({ shopifyShopAlias }) : null
  }
}
