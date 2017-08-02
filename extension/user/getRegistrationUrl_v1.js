/**
 * @param {object} context
 * @param {object} input
 * @param {function} cb
 * @property {string} shopifyShopDomain
 * @property {string} userRegistrationUrl
 */
module.exports = function (context, input, cb) {
  const registrationPath = '/account/register'
  cb(null, {
    url: context.config.userRegistrationUrl === ''
      ? context.config.shopifyShopDomain + registrationPath
      : context.config.userRegistrationUrl
  })
}
