import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'glamor';
import { Route, LoadingIndicator } from '@shopgate/engage/components';
import {
  logger,
  historyPush as historyPushAction,
  historyPop as historyPopAction,
  historyRedirect as historyRedirectAction,
  useTheme,
  event,
  useRoute,
  closeInAppBrowser,
} from '@shopgate/engage/core';
import {
  login as loginAction,
} from '@shopgate/engage/user';
import { useTabBarToggle } from './hooks';
import { fetchHeadlessLoginUrl } from '../../actions';
import { SHOPIFY_HEADLESS_LOGIN_ROUTE, SHOPIFY_HEADLESS_LOGIN_EVENT } from '../../../constants/headlessLogin';

const classes = {
  root: css({
    flex: 1,
    alignContent: 'center',
  }),
};

const mapDispatchToProps = {
  historyPush: historyPushAction,
  historyPop: historyPopAction,
  historyRedirect: historyRedirectAction,
  login: loginAction,
  fetchLoginUrl: fetchHeadlessLoginUrl,
};

/**
 * The ShopifyHeadlessLogin component replaces the core login screen. It doesn't show a regular
 * login form, but opens the In-App-Browser and initializes the headless login process.
 * @param {Object} props Component props
 * @returns {JSX.Element}
 */
const ShopifyHeadlessLogin = ({
  historyPush, historyPop, historyRedirect, login, fetchLoginUrl,
}) => {
  const { state: { redirect: redirectObj } = {} } = useRoute();
  const { View, AppBar } = useTheme();

  // Hide TabBar when login screen is visible
  useTabBarToggle();

  useEffect(() => {
    /**
     * Goto Shopify login page when component renders
     */
    (async () => {
      const loginUrl = await fetchLoginUrl();

      if (loginUrl) {
        historyPush({ pathname: loginUrl });
      }
    })();
  }, [fetchLoginUrl, historyPush]);

  const handleLogin = useCallback(async (data) => {
    logger.warn('Shopify headless login event received', data);

    try {
      await login(data, redirectObj, 'shopifyHeadlessLogin');
      historyRedirect(redirectObj);
    } catch (e) {
      logger.error('Failed to login Shopify customer', e);
      historyPop();
    }

    closeInAppBrowser();
  }, [historyPop, historyRedirect, login, redirectObj]);

  useEffect(() => {
    event.addCallback(SHOPIFY_HEADLESS_LOGIN_EVENT, handleLogin);

    return () => {
      event.removeCallback(SHOPIFY_HEADLESS_LOGIN_EVENT, handleLogin);
    };
  }, [handleLogin]);

  return (
    <View>
      <AppBar title="" right={null} />
      <div className={classes.root}>
        <LoadingIndicator />
      </div>
    </View>
  );
};

ShopifyHeadlessLogin.propTypes = {
  fetchLoginUrl: PropTypes.func.isRequired,
  historyPop: PropTypes.func.isRequired,
  historyPush: PropTypes.func.isRequired,
  historyRedirect: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
};

const ConnectedLogin = connect(null, mapDispatchToProps)(ShopifyHeadlessLogin);

export default () => (
  <Route
    pattern={SHOPIFY_HEADLESS_LOGIN_ROUTE}
    component={ConnectedLogin}
  />
);

