const ConfigHelper = require('../helper/config')

/**
 * @param {SDKContext} context
 */
module.exports = async (context) => {
  return `${ConfigHelper.getBaseUrl(context.config)}/account/register`
}
