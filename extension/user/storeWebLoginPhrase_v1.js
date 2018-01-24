/**
 * @typedef {object} input
 * @property {string} phrase
 *
 * @param context
 * @param input
 * @param cb
 * @returns {*}
 */
module.exports = function (context, input, cb) {
  saveWebLoginPhrase(input.phrase, context, cb)
}

/**
 * Saves the given web login phrase into internal device storage
 *
 * @param {string} phrase
 * @param {Object} context
 * @param {function({Object})} cb
 */
function saveWebLoginPhrase (phrase, context, cb) {
  // use device storage only
  context.storage.device.set('webLoginPhrase', phrase, (err) => {
    return cb(err || null)
  })
}
