import React from 'react';
import PropTypes from 'prop-types';
import { RouteContext } from '@shopgate/pwa-common/context';
import I18n from '@shopgate/pwa-common/components/I18n';
import Link from '@shopgate/pwa-common/components/Link';
import { CHECKOUT_PATH } from '@shopgate/pwa-common/constants/RoutePaths';
import styles from './style';
import {CHECKOUT_GUEST_PATH} from './../../constants/RoutePaths';
import config from '../../config';

/**
 * Check whether the guest checkout is disabled
 * @private
 * @returns {boolean}
 */
const disableGuestCheckout = () => !config.getUserAccountSettings;

/**
 * The GuestCheckoutLink component.
 * @param {Object} redirect The redirect object.
 * @return {JSX}
 */
const GuestCheckoutLink = ({ visible, redirectLocation }) => {
  const isCheckoutLogin = redirectLocation === CHECKOUT_PATH;

  if (disableGuestCheckout() || !visible || !isCheckoutLogin) {
    return null;
  }
  return (
    <div className={styles.container}>
      <I18n.Text string="checkout.or" className={styles.or} />
      <Link href={CHECKOUT_GUEST_PATH} className={styles.guestCheckout}>
        <I18n.Text string="checkout.continue_as_guest" />.
      </Link>
    </div>
  );
};

GuestCheckoutLink.propTypes = {
  visible: PropTypes.bool.isRequired,
  redirectLocation: PropTypes.string.isRequired,
};

export default () => (
  <RouteContext.Consumer>
    {({ state: {redirect: {location: redirectLocation = ''} = {}}, visible }) => (
      <GuestCheckoutLink
        redirectLocation={redirectLocation}
        visible={visible}
      />
    )}
  </RouteContext.Consumer>
);
