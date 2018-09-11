import React from 'react';
import PropTypes from 'prop-types';
import I18n from '@shopgate/pwa-common/components/I18n';
import Link from '@shopgate/pwa-common/components/Router/components/Link';
import { CHECKOUT_GUEST_PATH } from './route';
import styles from './style';
import config from '../../config';
import connect from './connector';

/**
 * Check is the guest checkout disabled
 * @private
 * @returns {boolean}
 */
const disableGuestCheckout = () => !config.getUserAccountSettings || config.getUserAccountSettings === 'required';

/**
 * The GuestCheckoutLink component.
 * @param {Object} redirect The redirect object.
 * @return {JSX}
 */
const GuestCheckoutLink = ({ redirect }) => {
  const isCheckoutLogin = redirect === '/checkout';

  if (disableGuestCheckout() || !isCheckoutLogin) {
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
  redirect: PropTypes.string.isRequired,
};

export default connect(GuestCheckoutLink);
