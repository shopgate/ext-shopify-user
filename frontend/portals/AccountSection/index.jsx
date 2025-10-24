import React from 'react';
import PropTypes from 'prop-types';
import { AccountBoxIcon, BoxIcon } from '@shopgate/engage/components';
import InfoIcon from '@shopgate/pwa-ui-shared/icons/InfoIcon';
import AccountItem from '../../components/AccountItem';
import { BookIcon, ChartIcon } from '../../icons';
import getConfig from '../../helpers/getConfig';
import connect from './connector';
import TitledFragment from '../../components/TitledFragment';
import { LABEL_ACCOUNT_TITLE } from '../../constants/accountManagement';

const { customerLinks } = getConfig();

/**
 * Android has both portals for printing, we need to make sure to use only one
 * @param {string} name - name of the portal
 * @return {boolean}
 */
const isDuplicate = name => !process.env.THEME.includes('ios') && name === 'nav-menu.logout.before';

const allIcons = { AccountBoxIcon, BoxIcon, InfoIcon, BookIcon, ChartIcon };

/**
 * Renders custom links
 * @param {Object} props -components
 * @return {undefined|Array<JSX.Element>}
 */
const renderCustomLinks = props => customerLinks
  .filter(link => link.show === true)
  .map(link => {
    const icon = allIcons[link.icon] || InfoIcon;

    return <AccountItem
      key={link.key}
      {...props}
      target={link.target}
      label={link.label}
      icon={icon}
    />
  });

/**
 * Account holds all the User Account links
 *
 * @param {Object} props -components
 * @param {JSX.Element} props.Section - nav section
 * @param {JSX.Element} props.Item - nav item
 * @param {boolean} props.isUserLoggedIn - logged in status
 * @return {?JSX.Element}
 * @constructor
 */
const Account = (props) => {
  const { name, Section, isUserLoggedIn } = props;
  const customerLinks = renderCustomLinks(props);

  if (!isUserLoggedIn || !customerLinks || !customerLinks.length || isDuplicate(name)) {
    return null;
  }

  return (
    <Section title={LABEL_ACCOUNT_TITLE}>
      {customerLinks}
    </Section>
  );
};

Account.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  Section: PropTypes.oneOfType([PropTypes.func, PropTypes.symbol]),
  customerLinks: PropTypes.array,
};
Account.defaultProps = {
  Section: TitledFragment,
  customerLinks: [],
};

export default connect(Account);
