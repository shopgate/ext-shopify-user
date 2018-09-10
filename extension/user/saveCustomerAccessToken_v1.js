module.exports = async function (context, input) {
  await context.storage.user.set('customerAccessToken', input.customerAccessToken)
}
