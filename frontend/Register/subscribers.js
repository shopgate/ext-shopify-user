import { appWillStart$ } from '@shopgate/pwa-common/streams/app';
import { redirects } from '@shopgate/pwa-common/collections';
import { LEGACY_URL } from '@shopgate/pwa-common/constants/Registration';
import { REGISTER_PATH } from '@shopgate/pwa-common/constants/RoutePaths';
import buildRegisterUrl from '@shopgate/pwa-common/subscriptions/helpers/buildRegisterUrl';
import fetchRegisterUrl from '@shopgate/pwa-common/actions/user/fetchRegisterUrl';
import { getRegisterUrl } from '@shopgate/pwa-common/selectors/user';
import { getCurrentRoute } from '@shopgate/pwa-common/helpers/router';
import { userDidLogin$ } from '@shopgate/pwa-common/streams/user';
import { historyPop, historyPush } from '@shopgate/pwa-common/actions/router';
import { registerRedirect } from '@shopgate/pwa-webcheckout-shopify/action-creators/register';
import { webCheckoutRegisterRedirect$ } from '@shopgate/pwa-webcheckout-shopify/streams';
import closeInAppBrowser from '@shopgate/pwa-core/commands/closeInAppBrowser';
import broadcastEvent from '@shopgate/pwa-core/commands/broadcastEvent';
import { routeDidEnter$ } from '@shopgate/pwa-common/streams/router';
import { isAndroid } from '@shopgate/pwa-common/selectors/client';
import {
  SHOPIFY_HEADLESS_LOGIN_STRATEGY,
} from '../constants/headlessLogin';
import { shopifyLoginStrategy } from '../config';

export default (subscribe) => {
  // No registration logic necessary when Shopify headless login is used
  if (shopifyLoginStrategy === SHOPIFY_HEADLESS_LOGIN_STRATEGY) return;

  /**
   * @param {Object} params The handler parameters.
   * @param {Function} params.dispatch The Redux dispatch function.
   * @param {Function} params.getState The Redux getState function.
   * @return {Promise<string>}
   */
  const redirectHandler = async ({ dispatch, getState }) => {
    /**
     * When the register url was opened from a login page, a redirect to the original target
     * page needs to happen after a successful registration. It's added by buildRegisterUrl.
     */
    const { state: { redirect: { location = '' } = {} } } = getCurrentRoute();

    let url = getRegisterUrl(getState());
    if (!url) {
      // Fetch a fresh url if none was found within the store.
      url = await dispatch(fetchRegisterUrl());
    }

    url = buildRegisterUrl(url || LEGACY_URL, location);

    // Dispatch redirect
    dispatch(registerRedirect(url));

    return url;
  };

  subscribe(appWillStart$, () => {
    redirects.set(REGISTER_PATH, redirectHandler, true);
  });

  const loginAfterRegisterRedirect$ = webCheckoutRegisterRedirect$
    .switchMap(() => userDidLogin$.first());
  const nextRouterAfterLoginRegister$ = loginAfterRegisterRedirect$
    .switchMap(() => routeDidEnter$.first());

  /**
   * Pop a login page after web registration / and redirect to checkout
   */
  subscribe(loginAfterRegisterRedirect$, ({ dispatch, getState }) => {
    const { state: { redirect: { location = '' } = {} } } = getCurrentRoute();
    dispatch(historyPop());

    closeInAppBrowser(isAndroid(getState()));

    if (location) {
      dispatch(historyPush({
        pathname: location,
      }));
    }
  });

  /**
   * Close loading spinner on next after login route
   */
  subscribe(nextRouterAfterLoginRegister$, () => {
    // Close loading view
    broadcastEvent({
      event: 'closeNotification',
    });
  });
};
