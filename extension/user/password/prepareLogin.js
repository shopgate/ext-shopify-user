const InvalidCallError = require('../../models/Errors/InvalidCallError')

/**
 * @typedef {Object} PrepareLoginInput
 * @property {string} mail - currently logged in user
 * @property {string} password - currently acive password
 * @property {string} oldPassword - old password for verification
 */
/**
 * @param {StepContext} context
 * @param {PrepareLoginInput} input
 */
module.exports = async (context, input) => {
  if (!input.password || !input.oldPassword) {
    throw new InvalidCallError()
  }

  return {
    strategy: 'basic',
    parameters: {
      login: input.mail,
      password: input.oldPassword
    }
  }
}
