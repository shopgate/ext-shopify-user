const UnknownError = require('../models/Errors/UnknownError')

/**
 * @typedef {object} input
 * @property {string} authSuccess
 * @property {string} authType
 * @property {string} login
 *
 * @param context
 * @param input
 * @param cb
 * @returns {*}
 */
module.exports = function (context, input, cb) {
  if (input.authSuccess !== true) {
    context.log.error(input.authType + ': Auth step finished unsuccessfully.')
    return cb(new UnknownError())
  }

  return cb(null, {})
}
