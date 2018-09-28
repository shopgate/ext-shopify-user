/**
 * @typedef {Object} SDKContext
 * @property {Object} config
 * @property {string} config.shopifyShopAlias
 * @property {string} config.shopifyAccessToken
 * @property {string} config.userRegistrationUrl
 * @property {string} config.userDataCacheTtl
 * @property {string} config.stage
 * @property {string} config.credentials.baseDomain
 * @property {string} config.credentials.clientId
 * @property {string} config.credentials.clientSecret
 * @property {string} config.credentials.refreshToken
 * @property {Object} config.requestTimeout
 * @property {number} config.requestTimeout.token
 * @property {number} config.requestTimeout.bigApi
 * @property {Object} meta
 * @property {string|number} meta.userId
 * @property {string} meta.appId
 * @property {Object} storage
 * @property {Object} storage.user
 * @property {Function} storage.user.get - (string key)
 * @property {Function} storage.user.set - (string key, mixed value)
 * @property {Function} storage.user.del - (string key)
 * @property {Object} storage.extension
 * @property {Function} storage.extension.get - (string key)
 * @property {Function} storage.extension.set - (string key, mixed value)
 * @property {Function} storage.extension.del - (string key)
 * @property {Function} storage.extension.map.get - (string mapName)
 * @property {Function} storage.extension.map.set - (string mapName, Object map)
 * @property {Function} storage.extension.map.del - (string mapName)
 * @property {Function} storage.extension.map.getItem - (string mapName, string key)
 * @property {Function} storage.extension.map.setItem - (string mapName, string key, string value)
 * @property {Function} storage.extension.map.delItem - (string mapName, string key)
 * @property {Object} log
 * @property {Function} log.trace
 * @property {Function} log.debug
 * @property {Function} log.info
 * @property {Function} log.warn
 * @property {Function} log.error
 * @property {Function} log.fatal
 */

/**
 * @typedef {Object} ShopifyAddress
 * @property {Object} address
 * @property {number} [id]
 * @property {string} [address1]
 * @property {string} [address2]
 * @property {string} [city]
 * @property {string} [company]
 * @property {string} [first_name]
 * @property {string} [last_name]
 * @property {string} [phone]
 * @property {string} [province_code] - 2 letter province/region/state code, e.g. AZ
 * @property {string} [province] - full name of province/region/state, e.g. Arizona
 * @property {string} country_code - 2 letter ISO2 code of country, e.g. US
 * @property {string} country - full name of country, e.g. United States
 * @property {string} [zip] - zip code of country
 * @property {string} [name] - full name of the customer, first + last
 * @property {boolean} [default] - whether the address is default
 */

/**
 * @typedef {Object} ShopgateAddress
 * @property {Object} address
 * @property {number} [id]
 * @property {string} [street1]
 * @property {string} [street2]
 * @property {string} [city]
 * @property {string} [company]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [phone]
 * @property {string} [province] - full name of province/region/state, e.g. Arizona
 * @property {string} country - full name of country, e.g. United States
 * @property {string} [zipCode] - zip code of country
 * @property {string[]} [tags] - list of cart specific tags, e.g. 'default', 'billing', etc.
 * @property {ShopgateAddressCustomAttributes} [customAttributes]
 */

/**
 * @typedef {Object} ShopgateAddressCustomAttributes
 * @property {string} [company]
 * @property {string} [phone]
 */

/**
 * @typedef {Object} ShopifyCustomer
 * @property {string} id The user ID in the format "gid://shopify/Customer/<id>" and base64 encoded
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string|null} phone
 */

/**
 * @typedef {Object} ShopifyCustomerAccessToken
 * @property {string} accessToken
 * @property {string} expiresAt
 */
