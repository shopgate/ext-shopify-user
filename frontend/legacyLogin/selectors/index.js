import appConfig from '@shopgate/pwa-common/helpers/config';

/**
 * Returns the Shopify checkout configuration.
 * @returns {Object|null}
 */
export const getShopifyCheckout = () => appConfig.webCheckoutShopify;

/**
 * Returns the Shopify URL based on the given domain or alias.
 * @returns {string}
 */
export const getShopifyUrl = () => {
  // Prioritize the "domain" property over alias, if it exists.
  let url = typeof getShopifyCheckout().domain === 'string'
    ? getShopifyCheckout().domain.replace(/\/+$/g, '')
    : `https://${getShopifyCheckout().alias}.myshopify.com`;

  // Add https protocol if none is set, yet.
  if (!url.match(/^https:\/\/.*/g) && !url.match(/^http:\/\/.*/g)) {
    // Cut out "://" or "//" from the beginning. E.g.: "//www.myshop.com" or "://www.myshop.com"
    url = `https://${url.replace(/^[:/]*/g, '')}`;
  }

  return url;
};

/**
 * Checks if a configuration for Shopify is available
 * @return {boolean}
 */
export const isShopify = () => {
  const { alias } = getShopifyCheckout() || {};
  return !!alias;
};
