/**
 * @param {SDKContext} context
 * @returns {Promise<void>|void}
 */
module.exports = async function (context) {
  return context.storage.user.del('userData')
}
