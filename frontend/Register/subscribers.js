import fetchRegisterUrl from '@shopgate/pwa-common/actions/user/fetchRegisterUrl';
import goBackHistory from '@shopgate/pwa-common/actions/history/goBackHistory';
import { getRegisterUrl } from '@shopgate/pwa-common/selectors/user';
import ParsedLink from '@shopgate/pwa-common/components/Router/helpers/parsed-link';
import { openedRegisterLink$ } from '@shopgate/pwa-common/streams/history';
import openRegisterUrl from '@shopgate/pwa-common/subscriptions/helpers/openRegisterUrl';
import { LEGACY_URL } from '@shopgate/pwa-common/constants/Registration';

export default (subscribe) => {
  // Open register link subscription
  subscribe(openedRegisterLink$, async ({ dispatch, getState }) => {
    const state = getState();

    const hasRegistrationUrl = !!getRegisterUrl(state);

    // Open the registration url if one is found.
    if (hasRegistrationUrl) {
      await dispatch(fetchRegisterUrl())
        .then(url => openRegisterUrl(url, state))
        .catch(e => e);
    } else {
      const link = new ParsedLink(LEGACY_URL);
      link.open();
    }

    dispatch(goBackHistory(1));
  });
};
