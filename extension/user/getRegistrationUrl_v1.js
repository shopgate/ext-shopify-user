/**
 * @param {object} context
 * @param {object} input
 * @param {function} cb
 * @property {string} shopifyShopAlias
 * @property {string} userRegistrationUrl
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
