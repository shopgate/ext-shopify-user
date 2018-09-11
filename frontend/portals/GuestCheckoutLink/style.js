import { css } from 'glamor';
import { themeConfig } from '@shopgate/pwa-common/helpers/config';

const { variables, colors } = themeConfig;

const container = css({
  display: 'inline-block',
}).toString();

const guestCheckout = css({
  display: 'inline-block',
  color: colors.primary,
  width: 'auto',
  margin: '-.35em',
  padding: '.35em',
}).toString();

const or = css({
  marginRight: variables.gap.small * 0.5,
}).toString();

export default {
  container,
  or,
  guestCheckout,
};
