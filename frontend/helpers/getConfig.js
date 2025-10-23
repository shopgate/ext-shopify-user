import { logger } from '@shopgate/pwa-core/helpers';

let cached;

/**
 * Gets extension config or empty object on failure.
 * @returns {CustomerLinks.Config}
 */
function getConfig() {
  if (!cached) {
    try {
      // eslint-disable-next-line global-require
      cached = require('../config');
    } catch (e) {
      logger.error('Could not read config.', e);
      cached = {};
    }
  }

  return cached;
}

export default getConfig;
