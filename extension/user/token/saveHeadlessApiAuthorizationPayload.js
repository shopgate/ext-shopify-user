/**
 * @typedef {Object} input
 * @property {string} authPayload
 *
 * @param {SDKContext} context
 * @param input
 */
module.exports = async (context, input) => {
  await context.storage.device.set('headlessAuthorizationPayload', input.authPayload)
}
