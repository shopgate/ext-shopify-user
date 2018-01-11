/**
 * @typedef {object} input
 * @property {string} payload
 *
 * @param context
 * @param input
 * @param cb
 * @returns {*}
 */
module.exports = function (context, input, cb) {
  context.log.info('Storing payload: ' + JSON.stringify(input.payload))

  return cb(null, {})
}
