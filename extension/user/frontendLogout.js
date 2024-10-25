const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @param {SDKContext} context
 * @returns {Promise<void>}
 */
module.exports = async function (context) {
  context.log.debug('Frontend logout step called')
  throw new UnauthorizedError()
}
