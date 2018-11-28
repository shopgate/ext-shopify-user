/**
 * @param {SDKContext} context The SDK context, which provides basic backend functionality and data.
 * @return {Promise<Object>}
 */
module.exports = async (context) => {
  const {
    addressDefaultGroups,
    userMenuEntries,
    addressForm
  } = context.config

  return {
    addressDefaultGroups,
    userMenuEntries,
    addressForm
  }
}
