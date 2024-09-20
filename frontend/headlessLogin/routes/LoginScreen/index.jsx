import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'glamor';
import { Route, LoadingIndicator } from '@shopgate/engage/components';
import {
  logger,
  PipelineRequest,
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
import { SHOPIFY_HEADLESS_LOGIN_ROUTE, SHOPIFY_HEADLESS_LOGIN_EVENT } from '../../../constants';

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
};

/**
 * The ShopifyHeadlessLogin component replaces the core login screen. It doesn't show a regular
 * login form, but opens the In-App-Browser and initializes the headless login process.
 * @param {Object} props Component props
 * @returns {JSX.Element}
 */
const ShopifyHeadlessLogin = ({
  historyPush, historyPop, historyRedirect, login,
}) => {
  const { state: { redirect: redirectObj } = {} } = useRoute();
  const { View, AppBar } = useTheme();

  // Hide TabBar when login screen is visible
  useTabBarToggle();

  /**
   * Retrieves the Shopify login url
   */
  const getLoginUrl = useCallback(async () => {
    try {
      const { loginUrl } = await new PipelineRequest('shopgate.user.getLoginUrl')
        .setTrusted()
        .dispatch();

      return loginUrl;
    } catch (e) {
      logger.error('Failed to fetch Shopify login url', e);
    }

    return null;
  }, []);

  useEffect(() => {
    /**
     * Goto Shopify login page when component renders
     */
    (async () => {
      const loginUrl = await getLoginUrl();

      if (loginUrl) {
        historyPush({ pathname: loginUrl });
      }
    })();
  }, [getLoginUrl, historyPush]);

  const handleLogin = useCallback(async (data) => {
    logger.warn('Shopify headless login event received', data);

    try {
      await login(data, redirectObj, 'shopifyHeadlessLogin');
      historyRedirect(redirectObj);
    } catch (e) {
      // TODO we should log out the user at the Shopify website when login in our system didn't work
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

