const ConfigHelper = require('../helper/config')

/**
 * @param {SDKContext} context
 */
module.exports = async (context) => {
  return { url: `${ConfigHelper.getBaseUrl(context.config)}/account/register` }
}
