import {
  PipelineRequest,
  HttpRequest,
  logger,
} from '@shopgate/engage/core';
import {
  SHOPIFY_HEADLESS_LOGIN_LOGIN_PIPELINE,
  SHOPIFY_HEADLESS_LOGIN_LOGOUT_PIPELINE,
} from '../constants/headlessLogin';

/**
 * Redux thunk to fetch the login url for the headless login strategy
 * @returns {Promise<string|null>}
 */
export const fetchHeadlessLoginUrl = () => async () => {
  try {
    const { loginUrl } = await new PipelineRequest(SHOPIFY_HEADLESS_LOGIN_LOGIN_PIPELINE)
      .setTrusted()
      .dispatch();

    return loginUrl;
  } catch (e) {
    logger.error('Failed to fetch Shopify headless login url', e);
  }

  return null;
};

/**
 * Redux thunk to fetch the logout url for the headless login strategy
 * @returns {Promise<string|null>}
 */
export const fetchHeadlessLogoutUrl = () => async () => {
  try {
    const { logoutUrl } = await new PipelineRequest(SHOPIFY_HEADLESS_LOGIN_LOGOUT_PIPELINE)
      .setTrusted()
      .dispatch();

    return logoutUrl;
  } catch (e) {
    logger.error('Failed to fetch Shopify headless logout url', e);
  }

  return null;
};

/**
 * Redux thunk to logout the users on the Shopify website for the headless login strategy
 * @returns {Promise<void>}
 */
export const headlessLogout = () => async (dispatch) => {
  const logoutUrl = await dispatch(fetchHeadlessLogoutUrl());

  if (!logoutUrl) {
    logger.warn('No logout url provided');
    return;
  }

  try {
    const response = await new HttpRequest(logoutUrl).dispatch();

    logger.warn('Shopify logout request response', response);
  } catch (e) {
    logger.error('Failed to perform a Shopify logout', e);
  }
};
