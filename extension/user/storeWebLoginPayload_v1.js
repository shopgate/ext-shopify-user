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
  saveWebLoginPayload(input.payload, context, cb)
}

/**
 * Saves the given web login payload into internal storage (user or device)
 *
 * @param {string} payload
 * @param {Object} context
 * @param {function({Object})} cb
 */
function saveWebLoginPayload (payload, context, cb) {
  // use device storage only
  context.storage.device.set('webLoginPayload', payload, (err) => {
    return cb(err || null)
  })
}