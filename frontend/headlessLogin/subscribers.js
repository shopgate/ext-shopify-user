import { css } from 'glamor';
import {
  appWillStart$, pwaDidAppear$, redirects, registerEvents, historyPop,
} from '@shopgate/engage/core';
import { LOGIN_PATH, REGISTER_PATH } from '@shopgate/engage/user';
import webCheckoutLogin from '@shopgate/pwa-webcheckout-shopify/actions/login';
import webCheckoutLogout from '@shopgate/pwa-webcheckout-shopify/actions/logout';
import {
  SHOPIFY_HEADLESS_LOGIN_EVENT,
  SHOPIFY_HEADLESS_LOGIN_ROUTE,
  SHOPIFY_HEADLESS_LOGIN_STRATEGY,
} from '../constants';
import { shopifyLoginStrategy } from '../config';

/**
 * Frontend subscriptions for the Shopify headless login
 * @param {Function} subscribe RxJS subscribe function
 */
export default (subscribe) => {
  // Do nothing when headless login strategy is not used
  if (shopifyLoginStrategy !== SHOPIFY_HEADLESS_LOGIN_STRATEGY) return;

  // Hide register button on iOS more page via CSS for PWA versions without suitable classes.
  // Since modern :has selector is used, (browser support from 2022) the register route will also
  // be replaced by the headless login screen
  css.global('[data-test-id="userMenu"] li:has([data-test-id="UserMenuRegister"])', {
    display: 'none',
  });
  // Hide register button on iOS more page via CSS
  css.global('.theme__more-page-register-button__container', {
    display: 'none',
  });

  subscribe(appWillStart$, () => {
    // Register for the login event dispatched by the landing page in the In-App-Browser
    registerEvents([SHOPIFY_HEADLESS_LOGIN_EVENT]);
    // Replace core login page with the custom Shopify headless login page
    redirects.set(LOGIN_PATH, SHOPIFY_HEADLESS_LOGIN_ROUTE);
    // Register button should be hidden via CSS. For WebViews where this doesn't work add some
    // extra protection by adding a redirect to the headless login
    redirects.set(REGISTER_PATH, SHOPIFY_HEADLESS_LOGIN_ROUTE);

    try {
      // The core implementation of the Shopify WebCheckout performs additional steps after PWA
      // login and logout. Those are implemented as dedicated WebCheckout actions.
      // This shouldn't cause issues, but let's try to deactivate this. When current PWA version
      // implements them as "mutable actions", we replace them with empty thunks.
      if (typeof webCheckoutLogin.replace === 'function') {
        webCheckoutLogin.replace(() => () => undefined);
      }

      if (typeof webCheckoutLogout.replace === 'function') {
        webCheckoutLogout.replace(() => () => undefined);
      }
    } catch {
      // Nothing to do here
    }
  });

  subscribe(pwaDidAppear$, ({ action, dispatch }) => {
    if (action.route.location === SHOPIFY_HEADLESS_LOGIN_ROUTE) {
      // Remove login page when the InAppBrowser was closed manually by the user
      dispatch(historyPop());
    }
  });
};
