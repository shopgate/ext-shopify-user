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
  saveWebLoginPayload(intput.payload, context, cb)
}

// /**
//  * Loads the web login payload if there is anything
//  *
//  * @param {Object} context
//  * @param {function({Object}, {string})} cb
//  */
// function loadWebLoginPayload (context, cb) {
//   // use device storage only
//   context.storage.device.get('webLoginPayload', (err, payload) => {
//     return cb(err, payload)
//   })
// }

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