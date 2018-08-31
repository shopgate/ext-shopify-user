import { appWillStart$ } from '@shopgate/pwa-common/streams/app';
import redirects from '@shopgate/pwa-common/collections/Redirects';
import { LEGACY_URL } from '@shopgate/pwa-common/constants/Registration';
import { REGISTER_PATH } from '@shopgate/pwa-common/constants/RoutePaths';

import buildRegisterUrl from '@shopgate/pwa-common/subscriptions/helpers/buildRegisterUrl';
import fetchRegisterUrl from '@shopgate/pwa-common/actions/user/fetchRegisterUrl';
import { getRegisterUrl } from '@shopgate/pwa-common/selectors/user';

export default (subscribe) => {
  /**
   * Redirect handler for registration links.
   * @param {Function} dispatch The redux dispatch function.
   * @param {Function} getState The redux getState function.
   * @return {Promise<string>}
   */
  const redirectHandler = async ({ dispatch, getState, action }) => {
    /**
     * When the register url was opened from a login page, a redirect to the original target
     * page needs to happen after a successful registration. It's added by buildRegisterUrl.
     */
    const { params: { state: { redirect: { location = '' } = {} } = {} } = {} } = action;

    let url = getRegisterUrl(getState());

    if (!url) {
      // Fetch a fresh url if none was found within the store.
      url = await dispatch(fetchRegisterUrl());
    }

    return buildRegisterUrl(url || LEGACY_URL, location);
  };

  subscribe(appWillStart$, () => {
    redirects.set(REGISTER_PATH, redirectHandler, true);
  });
};
