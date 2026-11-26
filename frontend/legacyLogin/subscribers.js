import { appDidStart$ } from '@shopgate/engage/core';
import { userWillLogin$, userWillLogout$ } from '@shopgate/engage/user';
import webCheckoutLogin from '@shopgate/pwa-webcheckout-shopify/actions/login';
import webCheckoutLogout from '@shopgate/pwa-webcheckout-shopify/actions/logout';

import { SHOPIFY_LEGACY_LOGIN_STRATEGY } from '../constants/legacyLogin';
import { shopifyLoginStrategy } from '../config';
import { legacyLogin, legacyLogout } from './actions';
import getShopUrl from '../helpers/getShopUrl';

export default (subscribe) => {
  // do nothing when legacy login strategy is not used
  if (shopifyLoginStrategy !== SHOPIFY_LEGACY_LOGIN_STRATEGY) return;

  // Disable PWA web checkout behavior after login / logout. It uses the legacy "webCheckoutShopify"
  // app config instead of the shop domain / alias of the extension config. Replaced by the
  // subscriptions below.
  if (typeof webCheckoutLogin.replace === 'function') {
    webCheckoutLogin.replace(() => () => undefined);
  }

  if (typeof webCheckoutLogout.replace === 'function') {
    webCheckoutLogout.replace(() => () => undefined);
  }

  subscribe(appDidStart$, () => {
    // Prefetch the shop URL, so it's usually cached when the user logs in
    getShopUrl().catch(() => undefined);
  });

  subscribe(userWillLogin$, ({ action, dispatch }) => {
    dispatch(legacyLogin(action.user, action.password, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }));
  });

  subscribe(userWillLogout$, ({ dispatch }) => {
    // Shopify might decline "*/*", which the iOS app sends when no accept header is set
    dispatch(legacyLogout({
      headers: { accept: 'text/html' },
    }));
  });
};
