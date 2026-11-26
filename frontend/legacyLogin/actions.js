import HttpRequest from '@shopgate/pwa-core/classes/HttpRequest';
import requestShopifyLogin from '@shopgate/pwa-webcheckout-shopify/action-creators/requestShopifyLogin';
import errorShopifyLogin from '@shopgate/pwa-webcheckout-shopify/action-creators/errorShopifyLogin';
import successShopifyLogin from '@shopgate/pwa-webcheckout-shopify/action-creators/successShopifyLogin';
import requestShopifyLogout from '@shopgate/pwa-webcheckout-shopify/action-creators/requestShopifyLogout';
import errorShopifyLogout from '@shopgate/pwa-webcheckout-shopify/action-creators/errorShopifyLogout';
import successShopifyLogout from '@shopgate/pwa-webcheckout-shopify/action-creators/successShopifyLogout';
import getShopUrl from '../helpers/getShopUrl';

/**
 * @typedef {Object} RequestOptions
 * @property {Object.<string, string>} [headers] - Optional request headers.
 */

const REQUEST_TIMEOUT = 20000;

/**
 * Reads a response header case-insensitively.
 * @param {Object} [headers] The response headers.
 * @param {string} name The lower case header name.
 * @returns {string|undefined}
 */
const getHeader = (headers, name) => {
  const key = Object.keys(headers || {}).find(header => header.toLowerCase() === name);
  return key ? headers[key] : undefined;
};

/**
 * Checks whether a redirect location points to the account page (independent of the domain and
 * of query parameters), which is where Shopify redirects to after a successful login.
 * @param {string} [location] The redirect location.
 * @returns {boolean}
 */
const isAccountPage = (location) => {
  if (typeof location !== 'string') return false;

  const path = location.split(/[?#]/)[0].replace(/\/+$/, '');
  return path.endsWith('/account');
};

/**
 * The web login which is currently in flight. A logout waits for it, so a late login response
 * (session cookie) can't revive the web session after the logout.
 * @type {Promise<void>|null}
 */
let pendingLogin = null;

/**
 * Performs the web login, see legacyLogin.
 * @param {Function} dispatch The redux dispatch function.
 * @param {string} [user] The login username.
 * @param {string} [password] The login password.
 * @param {RequestOptions} options Options containing request headers
 * @returns {Promise<void>}
 */
const performLogin = async (dispatch, user, password, options) => {
  if (!user || !password) {
    // No credentials to post (e.g. strategy "web" with customerId / payload). Dispatch the response
    // anyway to keep the streams in sync.
    dispatch(successShopifyLogin());
    return;
  }

  const shopUrl = await getShopUrl();

  if (!shopUrl) {
    // The success is dispatched here to take care that the streams work as expected
    dispatch(successShopifyLogin());
    return;
  }

  dispatch(requestShopifyLogin());

  let success = false;

  try {
    const request = new HttpRequest(`${shopUrl}/account/login`);

    if (options.headers) {
      request.setHeaders(options.headers);
    }

    const response = await request
      .setMethod('POST')
      .setTimeout(REQUEST_TIMEOUT)
      .setPayload({
        // eslint-disable-next-line camelcase
        form_type: 'customer_login',
        customer: {
          email: user,
          password,
        },
      })
      .dispatch();

    const { headers, statusCode } = response || {};
    success = statusCode === 302 && isAccountPage(getHeader(headers, 'location'));
  } catch (e) {
    success = false;
  }

  dispatch(success ? successShopifyLogin() : errorShopifyLogin());
};

/**
 * Login the current user on the Shopify web shop, so web pages opened in the In-App-Browser
 * (e.g. checkout, customer links) are logged in, too.
 * Always dispatches exactly one of successShopifyLogin / errorShopifyLogin, since the theme
 * waits for it (shopifyDidRespond$) to redirect after login.
 * @param {string} [user] The login username.
 * @param {string} [password] The login password.
 * @param {RequestOptions?} options Optional options containing request headers
 * @return {Function} A redux thunk.
 */
export const legacyLogin = (user, password, options = {}) => (dispatch) => {
  const login = performLogin(dispatch, user, password, options);
  pendingLogin = login;

  /** Forgets the login once it's done, unless a newer one started meanwhile. */
  const clear = () => {
    if (pendingLogin === login) pendingLogin = null;
  };
  login.then(clear, clear);

  return login;
};

/**
 * Logout the current user on the Shopify web shop.
 * @param {RequestOptions?} options Optional options containing request headers
 * @return {Function} A redux thunk.
 */
export const legacyLogout = (options = {}) => async (dispatch) => {
  if (pendingLogin) {
    // Wait for a web login in flight, its outcome doesn't matter
    await pendingLogin.catch(() => undefined);
  }

  const shopUrl = await getShopUrl();

  if (!shopUrl) {
    // When no shop url is available it doesn't make sense to do the request
    return;
  }

  dispatch(requestShopifyLogout());

  let success = false;

  try {
    const request = new HttpRequest(`${shopUrl}/account/logout`);

    if (options.headers) {
      request.setHeaders(options.headers);
    }

    const { statusCode } = (await request.setTimeout(REQUEST_TIMEOUT).dispatch()) || {};
    success = statusCode === 302;
  } catch (e) {
    success = false;
  }

  dispatch(success ? successShopifyLogout() : errorShopifyLogout());
};
