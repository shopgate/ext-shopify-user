import { appWillStart$ } from '@shopgate/pwa-common/streams/app';
import { redirects } from '@shopgate/pwa-common/collections';
import { isUserLoggedIn } from '@shopgate/pwa-common/selectors/user';
import { INDEX_PATH } from '@shopgate/pwa-common/constants/RoutePaths';
import trackingCore from '@shopgate/tracking-core/core/Core';
import { FETCH_CHECKOUT_URL_TIMEOUT } from '@shopgate/pwa-common-commerce/checkout/constants';
import fetchCheckoutUrl from '@shopgate/pwa-common-commerce/checkout/actions/fetchCheckoutUrl';
import { CHECKOUT_GUEST_PATH } from './../../constants/RoutePaths';

/**
 * Guest checkout subscriptions.
 * @param {Function} subscribe The subscribe function.
 */
export default (subscribe) => {
  /**
   * @param {Object} params params
   * @return {Promise<string>}
   */
  const guestCheckoutHandler = async ({ dispatch, getState }) => {
    if (isUserLoggedIn(getState())) {
      return INDEX_PATH;
    }

    const started = Date.now();
    const url = await dispatch(fetchCheckoutUrl());
    if (Date.now() - started > FETCH_CHECKOUT_URL_TIMEOUT) {
      return INDEX_PATH;
    }

    return trackingCore.crossDomainTracking(url);
  };

  subscribe(appWillStart$, () => {
    redirects.set(CHECKOUT_GUEST_PATH, guestCheckoutHandler, true);
  });
};
