const BigApiClient = require('./shopgate.bigapi.client')
const { ExternalBigAPI, TokenHandler } = require('@shopgate/bigapi-requester')

module.exports = class {
  /**
   * @param {SDKContext} context
   * @returns {BigApiClient}
   */
  static buildBigApi (context) {
    return new BigApiClient(
      new ExternalBigAPI(
        new TokenHandler(
          {
            api: 'https://{serviceName}.' + context.config.credentials.baseDomain,
            clientId: context.config.credentials.clientId,
            clientSecret: context.config.credentials.clientSecret,
            grantType: 'refresh_token',
            refreshToken: context.config.credentials.refreshToken
          }
        ),
        context.config.requestTimeout.bigApi
      )
    )
  }
}
