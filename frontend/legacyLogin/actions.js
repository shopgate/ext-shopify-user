import HttpRequest from '@shopgate/pwa-core/classes/HttpRequest';
import { isShopify, getShopifyUrl } from '@shopgate/pwa-webcheckout-shopify/selectors';
import requestShopifyLogin from '@shopgate/pwa-webcheckout-shopify/action-creators/requestShopifyLogin';
import errorShopifyLogin from '@shopgate/pwa-webcheckout-shopify/action-creators/errorShopifyLogin';
import successShopifyLogin from '@shopgate/pwa-webcheckout-shopify/action-creators/successShopifyLogin';

/**
 * @typedef {Object} LoginOptions
 * @property {Object.<string, string>} [headers] - Optional request headers.
 */

/**
 * Login the current user.
 * @param {string} user The login username.
 * @param {string} password The login password.
 * @param {LoginOptions?} options Optional options containing request headers
 * @return {Function} A redux thunk.
 */
export const legacyLogin = (user, password, options = {}) => (dispatch) => {
  if (!isShopify()) {
    // The success is dispatched here to take care that the streams work as expected
    dispatch(successShopifyLogin());
    return;
  }

  dispatch(requestShopifyLogin());

  const request = new HttpRequest(`${getShopifyUrl()}/account/login`);

  if (options.headers) {
    request.setHeaders(options.headers);
  }

  request
    .setMethod('POST')
    .setTimeout(20000)
    .setPayload({
      // eslint-disable-next-line camelcase
      form_type: 'customer_login',
      customer: {
        email: user,
        password,
      },
    })
    .dispatch()
    .then((response) => {
      const {
        headers: { location, Location } = {},
        statusCode,
      } = response;

      const redirectLocation = location || Location;

      if (statusCode === 302 && redirectLocation && redirectLocation.endsWith('/account')) {
        dispatch(successShopifyLogin());
      } else {
        dispatch(errorShopifyLogin());
      }
    })
    .catch(() => {
      dispatch(errorShopifyLogin());
    });
};
