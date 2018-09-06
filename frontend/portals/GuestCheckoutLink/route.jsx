import React from 'react';
import Route from '@shopgate/pwa-common/components/Router/components/Route';
import GuestCheckoutLink from './index';

/**
 * @param {Object} props props
 * @return {*}
 * @constructor
 */
const GuestCheckoutLinkRoute = props => (
  <Route
    path="/checkout_guest"
    component={GuestCheckoutLink}
    {...props}
  />
);

export default GuestCheckoutLinkRoute;
