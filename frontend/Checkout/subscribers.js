import trackingCore from '@shopgate/tracking-core/core/Core';
import { appWillStart$ } from '@shopgate/pwa-common/streams/app';
import { redirects } from '@shopgate/pwa-common/collections';
import { CHECKOUT_PATH } from '@shopgate/pwa-common/constants/RoutePaths';
import { isUserLoggedIn } from '@shopgate/pwa-common/selectors/user';
import { LEGACY_URL, FETCH_CHECKOUT_URL_TIMEOUT } from '@shopgate/pwa-common-commerce/checkout/constants';
import fetchCheckoutUrl from '@shopgate/pwa-common-commerce/checkout/actions/fetchCheckoutUrl';

export default (subscribe) => {
  /**
   * @param {Object} params The handler parameters.
   * @param {Function} params.dispatch The Redux dispatch function.
   * @param {Function} params.getState The Redux getState function.
   * @return {Promise<string>}
   */
  const redirectHandler = async ({ getState, dispatch }) => {
    if (!isUserLoggedIn(getState())) {
      return '';
    }

    const started = Date.now();
    const url = await dispatch(fetchCheckoutUrl());

    // Check if it took more than PWA allows. User is already back.
    if (Date.now() - started > FETCH_CHECKOUT_URL_TIMEOUT) {
      return '';
    }

    /**
     * Build the complete checkout url. Fallback to the
     * legacy url if the Pipeline returns an invalid url.
     * Add some tracking params for cross domain tracking.
     */
    return trackingCore.crossDomainTracking(url || LEGACY_URL);
  };

  subscribe(appWillStart$, () => {
    redirects.set(CHECKOUT_PATH, redirectHandler, true);
  });
};

