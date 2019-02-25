const UnknownError = require('../models/Errors/UnknownError')

/**
 * @typedef {Object} input
 * @property {string} authSuccess
 * @property {string} authType
 * @property {string} login
 *
 * @param {SDKContext} context
 * @param input
 *
 * @returns {Object}
 * @throws UnknownError
 */
module.exports = async (context, input) => {
  if (input.authSuccess !== true) {
    context.log.error(input.authType + ': Auth step finished unsuccessfully.')
    throw new UnknownError()
  }

  return {}
}
