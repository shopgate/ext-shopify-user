const InvalidCallError = require('../../models/Errors/InvalidCallError')

/**
 * @typedef {Object} PrepareLoginInput
 * @property {string} username - currently logged in user
 * @property {string} password - currently acive password
 */
/**
 * @param {SDKContext} context
 * @param {PrepareLoginInput} input
 */
module.exports = async (context, input) => {
  if (!input.password || !input.username) {
    throw new InvalidCallError()
  }

  return {
    strategy: 'basic',
    parameters: {
      login: input.username,
      password: input.password
    }
  }
}
