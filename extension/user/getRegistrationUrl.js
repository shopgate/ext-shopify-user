/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const registrationPath = 'https://' + context.config.shopifyShopAlias + '.myshopify.com/account/register'
  const urlResponse = {
    url: (context.config.userRegistrationUrl === '' || context.config.userRegistrationUrl === undefined
      ? registrationPath
      : context.config.userRegistrationUrl)
  }
  cb(null, urlResponse)
}
