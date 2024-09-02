import {
  appWillStart$, pwaDidAppear$, redirects, registerEvents, historyPop,
} from '@shopgate/engage/core';
import { LOGIN_PATH } from '@shopgate/engage/user';
import { SHOPIFY_HEADLESS_LOGIN_EVENT, SHOPIFY_LOGIN_ROUTE } from '../constants';
import { shopifyLoginStrategy } from '../config';

export default (subscribe) => {
  subscribe(appWillStart$, () => {
    if (shopifyLoginStrategy !== 'shopifyNewCustomerAccounts') return;

    registerEvents([SHOPIFY_HEADLESS_LOGIN_EVENT]);
    // Replace core login page with the custom Shopify login page
    redirects.set(LOGIN_PATH, SHOPIFY_LOGIN_ROUTE);
  });

  subscribe(pwaDidAppear$, ({ action, dispatch }) => {
    if (shopifyLoginStrategy !== 'shopifyNewCustomerAccounts') return;

    if (action.route.location === SHOPIFY_LOGIN_ROUTE) {
      // Remove login page when the InAppBrowser was closed manually by the user
      dispatch(historyPop());
    }
  });
};
