const InvalidCallError = require('../../models/Errors/InvalidCallError')

/**
 * @param {SDKContext} context The connect context.
 * @param {Object} input The step input
 * @throws {InvalidCallError}
 * @return {Object}
 */
module.exports = async (context, input) => {
  if (!input.userId) {
    throw new InvalidCallError(`Unknown strategy '${input.strategy}': Login strategy is not implemented.`)
  }

  return {}
}
