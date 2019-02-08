/**
 * @param {SDKContext} context
 */
module.exports = async (context) => {
  const registrationPath = 'https://' + context.config.shopifyShopAlias + '.myshopify.com/account/register'
  return {
    url: (context.config.userRegistrationUrl === '' || context.config.userRegistrationUrl === undefined
      ? registrationPath
      : context.config.userRegistrationUrl)
  }
}
