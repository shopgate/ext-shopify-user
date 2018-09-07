import React from 'react';
import { mount } from 'enzyme';
import I18n from '@shopgate/pwa-common/components/I18n';
import Link from '@shopgate/pwa-common/components/Router/components/Link';
//import GuestCheckoutLink from './index';

describe('<Link />', () => {
  it('should render with one chip', () => {
    const Component = (
      <Link href="guest_checkout">
        <I18n.Text string="checkout.continue_as_guest" />
      </Link>
    );
    const wrapper = mount(Component);
    expect(wrapper).toMatchSnapshot();
  });
});
