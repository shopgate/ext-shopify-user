/**
 * @typedef {Object} SDKContext
 * @property {ExtensionConfig} config
 * @property {SDKContextMeta} meta
 * @property {SDKContextStorage} storage
 * @property {SDKContextLog} log
 * @property {Function} tracedRequest
 */

/**
 * @typedef {Object} ExtensionConfig
 * @property {string} shopifyShopAlias
 * @property {string} shopifyAccessToken
 * @property {string} shopifyShopId
 * @property {string} shopifyHeadlessApiClientId
 * @property {string} shopifyHeadlessApiClientSecret
 * @property {string} shopifyHeadlessApiLoginRedirectUrl
 * @property {string} userRegistrationUrl
 * @property {string} userDataCacheTtl
 * @property {string} stage
 * @property {Object} credentials
 * @property {string} credentials.baseDomain
 * @property {string} credentials.clientId
 * @property {string} credentials.clientSecret
 * @property {string} credentials.refreshToken
 * @property {Object} requestTimeout
 * @property {number} requestTimeout.token
 * @property {number} requestTimeout.bigApi
 */

/**
 * @typedef {Object} SDKContextMeta
 * @property {string} deviceId
 * @property {string} appId
 * @property {string} userId
 * @property {string} appLanguage
 */

/**
 * @typedef {Object} SDKContextStorage
 * @property {SDKContextEntityStorage} extension
 * @property {SDKContextEntityStorage} device
 * @property {SDKContextEntityStorage} user
 */

/**
 * @typedef {Object} SDKContextEntityStorage
 * @property {Function} get - (string key)
 * @property {Function} set - (string key, mixed value)
 * @property {Function} del - (string key)
 * @property {Object} map
 * @property {Function} map.get - (string mapName)
 * @property {Function} map.set - (string mapName, Object map)
 * @property {Function} map.del - (string mapName)
 * @property {Function} map.getItem - (string mapName, string key)
 * @property {Function} map.setItem - (string mapName, string key, string value)
 * @property {Function} map.delItem - (string mapName, string key)
 */

/**
 * @typedef {Object} SDKContextLog
 * @property {Function} trace
 * @property {Function} debug
 * @property {Function} info
 * @property {Function} warn
 * @property {Function} error
 * @property {Function} fatal
 */

/**
 * @typedef {Object} SgxsMeta
 * @property {string} sessionId
 */

// ========= Shopify Specifics ==========
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
 * @typedef {Object} ShopifyStorefrontApiCustomer
 * @property {string} id The user ID in the format "gid://shopify/Customer/<id>" and since API version 2022-04 not base64 encoded anymore
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string|null} phone
 */

/**
 * @typedef {Object} ShopifyCustomerAccountApiCustomer
 * @property {string} id The user ID in the format "gid://shopify/Customer/<id>" and since API version 2022-04 not base64 encoded anymore
 * @property {{ emailAddress: string }?} emailAddress
 * @property {string} firstName
 * @property {string} lastName
 * @property {string|null} phoneNumber
 */

/**
 * @typedef {Object} StorefrontApiCustomerAccessToken
 * @property {string} accessToken
 * @property {string} expiresAt
 */

/**
 * @typedef {object} HeadlessAuthApiAccessToken
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {string} expiresAt
 * @property {string?} idToken
 */

/**
 * @typedef {Object} CustomerAccountApiAccessToken
 * @property {string} accessToken
 * @property {string?} expiresAt
 */

/**
 * @typedef {Object} ShopifyCustomerUpdateResponse
 * @property {Object} ShopifyCustomerAccessToken
 * @property {Object} ShopifyCustomer
 */

// ========= Shopgate Specifics ==========
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
 * @typedef {Object} ShopgateUser
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [email]
 * @property {ShopgateUserCustomAttributes} customAttributes
 */

/**
 * @typedef {Object} ShopgateAddressCustomAttributes
 * @property {string} [company]
 * @property {string} [phone]
 */

/**
 * @typedef {Object} ShopgateUserCustomAttributes
 * @property {string} [phone]
 */

/**
 * @typedef {Object} ShopgateUserGroups
 * @property {string} [id]
 * @property {string} [name]
 */

/**
 * @typedef {Object} UpdateMailInput
 * @property {string} mail - new email
 */
