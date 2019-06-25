const ConfigHelper = require('../helper/config')

/**
 * @param {SDKContext} context
 */
module.exports = async (context) => {
  const registrationPath = `${ConfigHelper.getBaseUrl(context.config)}/account/register`
  return {
    url: (context.config.userRegistrationUrl === '' || context.config.userRegistrationUrl === undefined
      ? registrationPath
      : context.config.userRegistrationUrl)
  }
}
