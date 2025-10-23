import { historyPush, logger, PipelineRequest } from '@shopgate/engage/core';
import { FETCH_CHECKOUT_URL_TIMEOUT } from '@shopgate/engage/checkout';
import { SHOPIFY_BUILD_MULTIPASS_URL_PIPELINE } from '../../constants/accountManagement';

/**
 * Passes the link target to Shopify Multipass encryption, then redirects to the resulting URL.
 *
 * @param {string} target The link target (URL or path relative to shop domain)
 * @return {Function}
 */
export const openPage = target => dispatch => {
  const started = Date.now();

  return new PipelineRequest(SHOPIFY_BUILD_MULTIPASS_URL_PIPELINE)
    .setTrusted()
    .setInput({ target })
    .dispatch()
    .then(({ url }) => {
      if (Date.now() - started > FETCH_CHECKOUT_URL_TIMEOUT) {
        return;
      }

      dispatch(historyPush({ pathname: url }));
    })
    .catch(error => logger.error('Error fetching Web Account Page URL', error));
};
