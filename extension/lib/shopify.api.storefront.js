const Tools = require('./tools')
const requestp = require('request-promise-native')
const UnknownError = require('../models/Errors/UnknownError')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const FieldValidationError = require('../models/Errors/FieldValidationError')

module.exports = class {
  /**
   * @param {string} shopAlias
   * @param {string} storefrontAccessToken
   * @param {Object} logger A generic logger instance, e.g. current step context's .log property.
   * @param {Function} requestLog A Shopify request log function as defined in ./logger.js
   */
  constructor (shopAlias, storefrontAccessToken, logger, requestLog) {
    this.apiUrl = `https://${shopAlias}.myshopify.com/api/graphql`
    this.storefrontAccessToken = storefrontAccessToken
    this.logger = logger
    this.requestLog = requestLog
  }

  /**
   * @param {string} login
   * @param {string} password
   * @return {Promise<ShopifyCustomerAccessToken>}
   */
  async getCustomerAccessToken (login, password) {
    const query = 'mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) ' +
      '{customerAccessTokenCreate(input: $input) ' +
      '{userErrors {field message} customerAccessToken {accessToken expiresAt}}}'

    const variables = {
      input: {
        email: login,
        password
      }
    }

    const operationName = 'customerAccessTokenCreate'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error creating customer access token.', err)
      throw new UnknownError()
    }

    if (!response.body.data) {
      this.logger.error(`No token received for login credentials: ${variables.input.login} / XXXXXXXX`)
      throw new UnknownError()
    }

    if (Tools.propertyExists(response.body.data, 'customerAccessTokenCreate.userErrors') &&
      !Tools.isEmpty(response.body.data.customerAccessTokenCreate.userErrors)) {
      throw new Error(response.body.data.customerAccessTokenCreate.userErrors[0].message)
    }

    return response.body.data.customerAccessTokenCreate.customerAccessToken
  }

  /**
   * @param {string} customerAccessToken
   * @returns {Promise<ShopifyCustomerAccessToken>}
   */
  async renewCustomerAccessToken (customerAccessToken) {
    const query = 'mutation customerAccessTokenRenew($customerAccessToken: String!) {' +
      'customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {' +
      'userErrors {field message} customerAccessToken {accessToken expiresAt}' +
      '}},'

    const variables = { customerAccessToken }
    const operationName = 'customerAccessTokenRenew'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error renewing customer access token.', err)
      throw new UnknownError()
    }

    if (!response.body.data) {
      this.logger.error(`No token received for login credentials: ${variables.input.login} / XXXXXXXX`)
      throw new UnknownError()
    }

    if (Tools.propertyExists(response.body.data, 'customerAccessTokenRenew.userErrors') &&
      !Tools.isEmpty(response.body.data.customerAccessTokenRenew.userErrors)) {
      throw new Error(response.body.data.customerAccessTokenRenew.userErrors[0].message)
    }

    return response.body.data.customerAccessTokenRenew.customerAccessToken
  }

  /**
   * @param {string} customerAccessToken
   * @returns {Promise<ShopifyCustomer>}
   * @throws UnknownError upon unknown API errors.
   * @throws CustomerNotFoundError if a user with this token wasn't found.
   */
  async getCustomerByAccessToken (customerAccessToken) {
    const response = await this.request(`query { customer(customerAccessToken: "${customerAccessToken}") { id email firstName lastName phone } }`)

    if (!response.body.data) {
      throw new UnknownError('Unknown error fetching customer data by customer access token.')
    }

    if (response.body.data.customer === null || response.statusCode === 403) {
      throw new CustomerNotFoundError()
    }

    return response.body.data.customer
  }

  /**
   * @param {string} customerAccessToken
   * @throws UnknownError upon unknown API errors.
   * @returns {Promise[<Object>]}
   */
  async customerGetAddresses (customerAccessToken) {
    const query = 'query getCustomerAddesses ($customerAccessToken: String!) ' +
      '{ customer (customerAccessToken: $customerAccessToken) ' +
      '{ defaultAddress { id}, addresses(first: 250) { edges ' +
      '{ node { id, address1, address2, city, company, countryCodeV2, firstName, lastName, phone, provinceCode, zip }}}}}'

    const variables = { customerAccessToken }
    const operationName = 'getCustomerAddesses'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error customer get addresses.', err)
      throw new UnknownError()
    }

    return new Promise((resolve) => {
      const { body: { errors, data } } = response

      if (Array.isArray(errors)) {
        errors.forEach(item => {
          this.logger.error('Error get customer address.', item.message)
        })
        throw new UnknownError()
      }

      return resolve(data)
    })
  }

  /**
   * @param {string} customerAccessToken
   * @param {Object} address
   * @throws UnknownError upon unknown API errors.
   * @returns {Promise<Object>}
   */
  async customerAddressCreate (customerAccessToken, address) {
    const query = 'mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) ' +
      '{customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address)' +
      '{customerAddress {id} customerUserErrors {field message}}}'

    const variables = { customerAccessToken, address }
    const operationName = 'customerAddressCreate'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error create customer address.', err)
      throw new UnknownError()
    }

    return new Promise((resolve, reject) => {
      const { body: { errors, data: { customerAddressCreate: { customerUserErrors, customerAddress } } } } = response

      if (Array.isArray(errors)) {
        errors.forEach(item => {
          this.logger.error('Error create customer address.', item.message)
        })
        throw new UnknownError()
      }

      if (customerUserErrors.length > 0) {
        reject(customerUserErrors)
      }

      return resolve(customerAddress)
    })
  }

  /**
   * @param {string} customerAccessToken
   * @param {string} id
   * @throws UnknownError upon unknown API errors.
   * @returns {boolean}
   */
  async customerAddressDelete (customerAccessToken, id) {
    const query = 'mutation customerAddressDelete($id: ID!, $customerAccessToken: String!) ' +
      '{customerAddressDelete(id: $id, customerAccessToken: $customerAccessToken) ' +
      '{userErrors {field message} customerUserErrors {field message} deletedCustomerAddressId }}'

    const variables = { customerAccessToken, id }
    const operationName = 'customerAddressDelete'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error delete customer address.', err)
      throw new UnknownError()
    }

    return new Promise((resolve, reject) => {
      const { body: { errors, data: { customerAddressDelete: { customerUserErrors } } } } = response

      if (Array.isArray(errors)) {
        errors.forEach(item => {
          this.logger.error('Error create customer address.', item.message)
        })
        throw new UnknownError()
      }

      if (customerUserErrors.length > 0) {
        reject(customerUserErrors)
      }

      return resolve(true)
    })
  }

  /**
   * @param {string} customerAccessToken
   * @param {string} addressId
   * @throws UnknownError upon unknown API errors.
   * @returns {Promise}
   */
  async customerDefaultAddressUpdate (customerAccessToken, addressId) {
    const query = 'mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) ' +
      '{ customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) ' +
      ' { userErrors { field message } customer { id } customerUserErrors { field message }}}'

    const variables = { customerAccessToken, addressId }
    const operationName = 'customerDefaultAddressUpdate'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error customer set default address.', err)
      throw new UnknownError()
    }

    return new Promise((resolve, reject) => {
      const { body: { errors, data: { customerDefaultAddressUpdate: { customerUserErrors } } } } = response
      if (Array.isArray(errors)) {
        errors.forEach(item => {
          this.logger.error('Error customer set default address.', item.message)
        })
        throw new UnknownError()
      }

      if (customerUserErrors.length > 0) {
        reject(customerUserErrors)
      }

      return resolve()
    })
  }

  /**
   * @param {string} customerAccessToken
   * @param {string} id
   * @param {Object} address
   * @throws UnknownError upon unknown API errors.
   * @returns {Promise<Object>}
   */
  async customerAddressUpdate (customerAccessToken, id, address) {
    const query = 'mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) ' +
      '{customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) ' +
      '{userErrors {field message} customerAddress {id} customerUserErrors { field message }}}'

    const variables = { customerAccessToken, id, address }
    const operationName = 'customerAddressUpdate'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error update customer address.', err)
      throw new UnknownError()
    }

    return new Promise((resolve, reject) => {
      const { body: { errors, data: { customerAddressUpdate: { customerUserErrors } } } } = response
      if (Array.isArray(errors)) {
        errors.forEach(item => {
          this.logger.error('Error update customer address.', item.message)
        })
        throw new UnknownError()
      }

      if (customerUserErrors.length > 0) {
        reject(customerUserErrors)
      }

      return resolve()
    })
  }

  /**
   * @param {string} customerAccessToken
   * @param {Object} customer
   * @returns {Promise<ShopifyCustomerUpdateResponse>}
   * @throws UnknownError upon unknown API errors.
   * @throws FieldValidationError - If data could not be updated, because of validation errors from Shopify
   */
  async updateCustomerByAccessToken (customerAccessToken, customer) {
    const query = 'mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {' +
      'customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {' +
      'userErrors {field message} customerAccessToken {accessToken expiresAt} customer {id firstName lastName}' +
      '}}'

    const variables = { customerAccessToken, customer }
    const operationName = 'customerUpdate'

    let response = {}
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error('Error updating customer data.', err)
      throw new UnknownError()
    }

    if (!response.body && !response.body.data) {
      throw new UnknownError('Unknown error fetching updating customer data.')
    }

    if (Tools.propertyExists(response.body.data, 'customerUpdate.userErrors') &&
      !Tools.isEmpty(response.body.data.customerUpdate.userErrors)
    ) {
      const validationError = new FieldValidationError()
      response.body.data.customerUpdate.userErrors.forEach(responseError => {
        validationError.addStorefrontValidationMessage(responseError.field.pop(), responseError.message)
      })
      throw validationError
    }

    return response.body.data.customerUpdate
  }

  /**
   * @param {string} query
   * @param {Object} variables
   * @param {string} operationName
   * @returns {Promise<Object>}
   */
  async request (query, variables = undefined, operationName = undefined) {
    const options = {
      method: 'POST',
      uri: this.apiUrl,
      headers: {
        'cache-control': 'no-cache',
        'x-shopify-storefront-access-token': this.storefrontAccessToken,
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: {
        query,
        variables,
        operationName
      },
      json: true,
      simple: false,
      resolveWithFullResponse: true
    }

    // TODO move this into a more general obfuscator class or function (SHOPIFY-562)
    const logOptions = JSON.parse(JSON.stringify(options))
    if (variables && variables.input && variables.input.password) {
      logOptions.body.variables.input.password = 'XXXXXXXX'
    }

    let response
    try {
      response = await requestp(options)
    } catch (err) {
      this.requestLog(logOptions, null)
      throw err
    }

    this.requestLog(logOptions, response)

    return response
  }
}
