/**
 * @typedef {Object} input
 * @property {string} mail
 *
 * @param {SDKContext} context
 * @param input
 * @return {{eventData: input}}
 */
module.exports = async (context, input) => {
  return {
    eventData: input
  }
}
