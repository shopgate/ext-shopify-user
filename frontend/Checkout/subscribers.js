import goBackHistory from '@shopgate/pwa-common/actions/history/goBackHistory';
import { isUserLoggedIn } from '@shopgate/pwa-common/selectors/user';
import ParsedLink from '@shopgate/pwa-common/components/Router/helpers/parsed-link';
import trackingCore from '@shopgate/tracking-core/core/Core';
import {
  LEGACY_URL,
  FETCH_CHECKOUT_URL_TIMEOUT,
} from '@shopgate/pwa-common-commerce/checkout/constants';
import { openedCheckoutLink$ } from '@shopgate/pwa-common-commerce/checkout/streams';
import fetchCheckoutUrl from '@shopgate/pwa-common-commerce/checkout/actions/fetchCheckoutUrl';

/**
 * Checkout subscriptions.
 * @param {Function} subscribe The subscribe function.
 */
export default function checkout(subscribe) {
  /**
   * Gets triggered when the user enters the checkout.
   */
  subscribe(openedCheckoutLink$, ({ dispatch, getState }) => {
    // Check if user is logged in.
    if (!isUserLoggedIn(getState())) {
      return;
    }

    const started = Date.now();

    dispatch(fetchCheckoutUrl())
      .then((url) => {
        // Forget if it took more than PWA allows. User is already back.
        if (Date.now() - started > FETCH_CHECKOUT_URL_TIMEOUT) {
          return;
        }
        /**
         * Build the complete checkout url. Fallback to the
         * legacy url if the Pipeline returns an invalid url.
         * Add some tracking params for cross domain tracking.
         */
        const checkoutUrl = trackingCore.crossDomainTracking(url || LEGACY_URL);

        // Open the checkout.
        const link = new ParsedLink(checkoutUrl);
        link.open();
        dispatch(goBackHistory(1));
      })
      .catch(() => dispatch(goBackHistory(1)));
  });
}
