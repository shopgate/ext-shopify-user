/**
 * @typedef {Object} input
 * @property {string} phrase
 *
 * @param {SDKContext} context
 * @param input
 */
module.exports = async (context, input) => {
  context.storage.device.set('webLoginPhrase', input.phrase)
}
