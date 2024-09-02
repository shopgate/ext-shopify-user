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
  useTheme,
  event,
  useRoute,
  closeInAppBrowser,
} from '@shopgate/engage/core';
import {
  login as loginAction,
} from '@shopgate/engage/user';
import { useTabBarToggle } from './hooks';
import { SHOPIFY_LOGIN_ROUTE, SHOPIFY_HEADLESS_LOGIN_EVENT } from '../../constants';

const classes = {
  root: css({
    flex: 1,
    alignContent: 'center',
  }),
};

const mapDispatchToProps = {
  historyPush: historyPushAction,
  historyPop: historyPopAction,
  login: loginAction,
};

/**
 * The ShopifyLogin component
 * @param {Object} props Component props
 * @returns {JSX.Element}
 */
const ShopifyLogin = ({ historyPush, historyPop, login }) => {
  const { state: { redirect } = {} } = useRoute();
  const { View, AppBar } = useTheme();

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
    const gotoLogin = async () => {
      const loginUrl = await getLoginUrl();

      if (loginUrl) {
        // TODO Error handling required?!
        historyPush({ pathname: loginUrl });
      }
    };

    gotoLogin();
  }, [getLoginUrl, historyPush]);

  const handleLogin = useCallback(async (data) => {
    try {
      await login(data, redirect, 'shopifyHeadlessLogin');
    } catch (e) {
      logger.error('Failed to login Shopify customer', e);
      // TODO Error handling required?!
      historyPop();
    }

    closeInAppBrowser();
  }, [historyPop, login, redirect]);

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

ShopifyLogin.propTypes = {
  historyPop: PropTypes.func.isRequired,
  historyPush: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
};

const ConnectedLogin = connect(null, mapDispatchToProps)(ShopifyLogin);

export default () => (
  <Route
    pattern={SHOPIFY_LOGIN_ROUTE}
    component={ConnectedLogin}
  />
);

