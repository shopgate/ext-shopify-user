/**
 * @param {object} context
 * @param {object} input
 *
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  cb(null, {
    eventData: input
  })
}
