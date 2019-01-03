const crypto = require('crypto')
const BigApiFactory = require('../lib/shopgate.bigapi.factory')
let taskSchedulerUpdateRequired = true

/**
 * @param {SDKContext} context
 *
 * @returns {Promise<void>}
 */
module.exports = async function (context) {
  if (!taskSchedulerUpdateRequired) return

  // look up DB setting if local variable not initialized, yet
  let storageTaskSchedulerUpdateRequired
  try {
    storageTaskSchedulerUpdateRequired = await context.storage.extension.get('taskSchedulerUpdateRequired_2')
  } catch (err) {
    context.log.error(err)
    return
  }
  if (storageTaskSchedulerUpdateRequired === false) {
    taskSchedulerUpdateRequired = false
    return
  }

  // update task scheduler with a schedule for this app
  const bigApiClient = BigApiFactory.buildBigApi(context)
  const pipelineApiKey = crypto.randomBytes(Math.floor(Math.random() * 10 + 20)).toString('base64')

  try {
    await bigApiClient.scheduleCustomerTokenRenew(context.config.stage, context.meta.appId, pipelineApiKey)
  } catch (err) {
    context.log.error(err)
    return
  }

  try {
    await context.storage.extension.set('taskSchedulerUpdateRequired_2', false)
  } catch (err) {
    context.log.error(err)
    return
  }

  try {
    await context.storage.extension.set('renewCustomerAccessTokenPipelineApiKey', pipelineApiKey)
  } catch (err) {
    context.log.error(err)
    return
  }

  taskSchedulerUpdateRequired = false
}
