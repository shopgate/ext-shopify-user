import { PipelineRequest, logger, ERROR_HANDLE_SUPPRESS } from '@shopgate/engage/core';
import { getShopifyCheckout } from '@shopgate/pwa-webcheckout-shopify/selectors';
import { SHOPIFY_GET_SHOP_URL_PIPELINE } from '../constants/legacyLogin';

// Keep it short, the theme waits for the web login before redirecting after login
const PIPELINE_TIMEOUT = 5000;

/** @type {string|null} */
let cachedShopUrl = null;

/** @type {Promise<string|null>|null} */
let pendingRequest = null;

/**
 * Removes trailing slashes and adds the https protocol if none is set.
 * @param {*} url The URL to normalize.
 * @returns {string|null}
 */
const normalizeUrl = (url) => {
  if (typeof url !== 'string') return null;

  const result = url.trim().replace(/\/+$/, '');
  if (!result) return null;

  if (/^https?:\/\//i.test(result)) return result;

  // Cut out "://" or "//" from the beginning, e.g. "//www.myshop.com" or "://www.myshop.com"
  return `https://${result.replace(/^[:/]*/, '')}`;
};

/**
 * Returns the legacy "webCheckoutShopify" app config.
 * @returns {Object} The config ({ domain, alias }), empty object if not available.
 */
const getLegacyConfig = () => {
  try {
    return getShopifyCheckout() || {};
  } catch (e) {
    return {};
  }
};

/**
 * @returns {string|null} The shop domain of the legacy "webCheckoutShopify" app config.
 */
const getLegacyDomainUrl = () => normalizeUrl(getLegacyConfig().domain);

/**
 * @returns {string|null} The alias based URL of the legacy "webCheckoutShopify" app config.
 */
const getLegacyAliasUrl = () => {
  const { alias } = getLegacyConfig();
  return typeof alias === 'string' && alias.trim() ? `https://${alias.trim()}.myshopify.com` : null;
};

/**
 * Fetches the shop domain and alias based URL of the extension config via pipeline.
 * @returns {Promise<Object|null>} The URLs ({ shopDomain, aliasUrl }), null on failure.
 */
const fetchExtensionUrls = async () => {
  try {
    const { shopDomain, aliasUrl } = await new PipelineRequest(SHOPIFY_GET_SHOP_URL_PIPELINE)
      .setTrusted()
      .setRetries(0)
      .setTimeout(PIPELINE_TIMEOUT)
      .setHandleErrors(ERROR_HANDLE_SUPPRESS)
      .dispatch();

    return {
      shopDomain: normalizeUrl(shopDomain),
      aliasUrl: normalizeUrl(aliasUrl),
    };
  } catch (e) {
    logger.error('Failed to fetch the Shopify shop URL', e);
  }

  return null;
};

/**
 * Resolves the shop URL in this order: shop domain of the extension config, shop domain of the
 * legacy app config, alias URL of the extension config, alias URL of the legacy app config.
 * @param {Object|null} extensionUrls The URLs of the extension config ({ shopDomain, aliasUrl })
 * or null when they couldn't be fetched.
 * @returns {string|null}
 */
const resolveShopUrl = (extensionUrls) => {
  const { shopDomain = null, aliasUrl = null } = extensionUrls || {};

  return shopDomain || getLegacyDomainUrl() || aliasUrl || getLegacyAliasUrl();
};

/**
 * Resolves the base URL of the Shopify web shop (e.g. "https://www.myshop.com"). See
 * resolveShopUrl for the precedence. The result is cached after the first successful pipeline
 * request. When the pipeline fails, only the legacy app config is used (not cached).
 * @returns {Promise<string|null>} The shop URL without trailing slash, null if none is available.
 */
const getShopUrl = async () => {
  if (cachedShopUrl) return cachedShopUrl;

  if (!pendingRequest) {
    pendingRequest = fetchExtensionUrls().then((extensionUrls) => {
      pendingRequest = null;
      const url = resolveShopUrl(extensionUrls);

      if (extensionUrls && url) cachedShopUrl = url;

      return url;
    });
  }

  return pendingRequest;
};

export default getShopUrl;
