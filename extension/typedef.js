/**
 * @typedef {Object} SDKContext
 * @property {Object} config
 * @property {string} config.shopifyShopAlias
 * @property {string} config.shopifyAccessToken
 * @property {string} config.userRegistrationUrl
 * @property {Object} meta
 * @property {string|number} meta.userId
 * @property {Object} storage
 * @property {Object} storage.user
 * @property {Function} storage.user.get - (string key, Function cb)
 * @property {Function} storage.user.set - (string key, mixed value, Function cb)
 * @property {Function} storage.user.del - (string key, Function cb)
 * @property {Object} log
 * @property {Function} log.trace
 * @property {Function} log.debug
 * @property {Function} log.info
 * @property {Function} log.warn
 * @property {Function} log.error
 * @property {Function} log.fatal
 */
