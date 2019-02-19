/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.customerAccessToken
 * @param {string} input.userId
 * @returns {Promise<void>}
 * @throws Error when saving the customer access token fails.
 */
module.exports = async (context, input) => {
  await context.storage.user.set('customerAccessToken', input.customerAccessToken)
  await context.storage.extension.map.setItem('customerTokensByUserIds', input.userId, input.customerAccessToken)
}
