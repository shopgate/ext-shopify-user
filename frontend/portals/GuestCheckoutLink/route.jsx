import React from 'react';
import Route from '@shopgate/pwa-common/components/Router/components/Route';
import GuestCheckoutLink from './index';

/**
 * Define guest checkout route
 */
export const CHECKOUT_GUEST_PATH = '/checkout_guest';

/**
 * @param {Object} props props
 * @return {*}
 * @constructor
 */
const GuestCheckoutLinkRoute = props => (
  <Route
    path={CHECKOUT_GUEST_PATH}
    component={GuestCheckoutLink}
    {...props}
  />
);

export default GuestCheckoutLinkRoute;
