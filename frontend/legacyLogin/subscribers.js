import { userWillLogin$ } from '@shopgate/engage/user';
import webCheckoutLogin from '@shopgate/pwa-webcheckout-shopify/actions/login';

import { SHOPIFY_LEGACY_LOGIN_STRATEGY } from '../constants/legacyLogin';
import { shopifyLoginStrategy } from '../config';
import { legacyLogin } from './actions';

export default (subscribe) => {
  // do nothing when legacy login strategy is not used
  if (shopifyLoginStrategy !== SHOPIFY_LEGACY_LOGIN_STRATEGY) return;

  // disable PWA behavior after login
  if (typeof webCheckoutLogin.replace === 'function') {
    webCheckoutLogin.replace(() => () => undefined);
  }

  subscribe(userWillLogin$, ({ action, dispatch }) => {
    dispatch(legacyLogin(action.user, action.password, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }));
  });
};
