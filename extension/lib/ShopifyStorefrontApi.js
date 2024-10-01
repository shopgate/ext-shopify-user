const request = require('request-promise-native')
const UnknownError = require('../models/Errors/UnknownError')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const FieldValidationError = require('../models/Errors/FieldValidationError')
const AddressValidationError = require('../models/Errors/AddressValidationError')
const InvalidCredentialsError = require('../models/Errors/InvalidCredentialsError')
const TokenRenewError = require('../models/Errors/TokenRenewError')
const _ = {
  get: require('lodash/get')
}

class ShopifyStorefrontApi {
  /**
   * @param {string} shopUrl
   * @param {ShopifyApiTokenManager} shopifyApiTokenManager
   * @param {SDKContextLog} logger A generic logger instance, e.g. current step context's .log property.
   * @param {Function} requestLog A Shopify request log function as defined in ./logger.js
   * @param {string?} apiVersion
   */
  constructor (shopUrl, shopifyApiTokenManager, logger, requestLog, apiVersion = '2023-10') {
    this.apiUrl = `${shopUrl.replace(/\/+$/, '')}/api/${apiVersion}/graphql`
    this.tokenManager = shopifyApiTokenManager
    this.logger = logger
    this.requestLog = requestLog
  }

  /**
   * @param {string} login
   * @param {string} password
   * @return {Promise<StorefrontApiCustomerAccessToken>}
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
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating customer access token.')
      throw new UnknownError()
    }

    if (!response.body && !response.body.data) {
      this.logger.error({ login, password: 'XXXXXXXX' }, 'No token received for login credentials.')
      throw new UnknownError()
    }

    const errorMessage = _.get(response, `body.data.${operationName}.userErrors[0].message`)
    if (errorMessage) {
      throw new InvalidCredentialsError(errorMessage)
    }

    return response.body.data.customerAccessTokenCreate.customerAccessToken
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
   * @returns {Promise<Object>}
   */
  async customerAddressesGet (customerAccessToken) {
    const query = 'query customerAddressesGet($customerAccessToken: String!) ' +
      '{ customer (customerAccessToken: $customerAccessToken) ' +
      '{ defaultAddress { id}, addresses(first: 250) { edges ' +
      '{ node { id, address1, address2, city, company, countryCodeV2, firstName, lastName, phone, provinceCode, zip }}}}}'

    const variables = { customerAccessToken }
    const operationName = 'customerAddressesGet'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error customer get addresses.')
      throw new UnknownError()
    }

    return new Promise((resolve) => {
      const { body: { errors, data } } = response

      if (Array.isArray(errors)) {
        this.logger.error({ errorMessages: errors.map(error => error.message || 'n/a') }, 'Error get customer address.')
        throw new UnknownError()
      }

      return resolve(data)
    })
  }

  /**
   * @param {string} customerAccessToken
   * @param {Object} address
   * @throws UnknownError upon unknown API errors.
   * @throws FieldValidationError when provided fields have issues
   * @throws AddressValidationError when there is an unknown issue with Address validation
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
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating a customer address')
      throw new UnknownError()
    }

    const errors = _.get(response, 'body.errors')
    if (errors && Array.isArray(errors)) {
      this.logger.error({ errorMessages: errors.map(error => error.message || '') }, 'Error creating a customer address')
      throw new UnknownError()
    }

    const customerUserErrors = _.get(response, `body.data.${operationName}.customerUserErrors`, [])
    await this.parseValidationErrors(customerUserErrors)

    const customerAddress = _.get(response, `body.data.${operationName}.customerAddress`)
    if (!customerAddress) {
      this.logger.error('No address ID returned when trying to create customer address')
      throw new UnknownError()
    }

    return customerAddress
  }

  /**
   * @param {string} customerAccessToken
   * @param {string} id
   * @throws UnknownError upon unknown API errors.
   * @return {Promise<void>}
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
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error deleting a customer address')
      throw new UnknownError()
    }

    const errors = _.get(response, 'body.errors')
    if (errors && Array.isArray(errors)) {
      this.logger.error({ errorMessages: errors.map(error => error.message || '')}, 'Error deleting a customer address')
      throw new UnknownError()
    }

    const customerUserErrors = _.get(response, `body.data.${operationName}.customerUserErrors`, [])
    await this.parseValidationErrors(customerUserErrors)
  }

  /**
   * @param {string} customerAccessToken
   * @param {string} addressId
   * @throws UnknownError upon unknown API errors.
   * @throws FieldValidationError when provided fields have issues
   * @throws AddressValidationError when there is an unknown issue with Address validation
   * @return {Promise<void>}
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
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error setting the default customer address')
      throw new UnknownError()
    }

    const errors = _.get(response, 'body.errors')
    if (errors && Array.isArray(errors)) {
      this.logger.error({ errorMessages: errors.map(error => error.message || '') }, 'Error setting the default customer address')
      throw new UnknownError()
    }

    const customerUserErrors = _.get(response, `body.data.${operationName}.customerUserErrors`, [])
    await this.parseValidationErrors(customerUserErrors)
  }

  /**
   * @param {string} customerAccessToken
   * @param {string} id
   * @param {Object} address
   * @throws UnknownError upon unknown API errors.
   * @throws FieldValidationError when provided fields have issues
   * @throws AddressValidationError when there is an unknown issue with Address validation
   * @returns {Promise<void>}
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
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error updating customer address.')
      throw new UnknownError()
    }

    const errors = _.get(response, 'body.errors')
    if (errors && Array.isArray(errors)) {
      this.logger.error({ errorMessages: errors.map(error => error.message || '') }, 'Error updating customer address.')
      throw new UnknownError()
    }

    const customerUserErrors = _.get(response, `body.data.${operationName}.customerUserErrors`, [])
    await this.parseValidationErrors(customerUserErrors)
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
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error updating customer data.')
      throw new UnknownError()
    }

    if (!response.body && !response.body.data) {
      throw new UnknownError('Unknown error fetching updating customer data.')
    }

    /** @type {Object[]} */
    const errorMessages = _.get(response, `body.data.${operationName}.userErrors`, [])
    await this.parseValidationErrors(errorMessages)

    return response.body.data.customerUpdate
  }

  /**
   * @param {string} query
   * @param {Object} variables
   * @param {string} operationName
   * @param {number} recursiveCalls
   * @returns {Promise<Object>}
   */
  async request (query, variables = undefined, operationName = undefined, recursiveCalls = 0) {
    const currentAccessToken = await this.tokenManager.getStorefrontApiAccessToken()

    const options = {
      method: 'POST',
      uri: this.apiUrl,
      headers: {
        'cache-control': 'no-cache',
        'x-shopify-storefront-access-token': currentAccessToken,
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
      response = await request(options)
    } catch (err) {
      this.requestLog(logOptions, null)
      throw err
    }

    if ((response.statusCode === 401 || response.statusCode === 403) && recursiveCalls < 2) {
      const newToken = await this.tokenManager.getStorefrontApiAccessToken(false)
      if (currentAccessToken === newToken) {
        throw new UnknownError('Error accessing the storefront with given storefront access token.')
      }

      return this.request(query, variables, operationName, recursiveCalls + 1)
    }

    this.requestLog(logOptions, response)

    return response
  }

  /**
   * Helper for throwing validation errors
   *
   * @param {{field:string[], message:string}[]} errors
   * @throws FieldValidationError when provided fields have issues
   * @throws AddressValidationError when there is an unknown issue with Address validation
   * @return {Promise<void>}
   */
  async parseValidationErrors (errors) {
    if (errors.length > 0) {
      const validationError = new FieldValidationError()
      errors.forEach(error => {
        const { field, message } = error
        if (Object.hasOwnProperty.call(error, 'problems')) {
          throw new AddressValidationError(message)
        }

        if (Array.isArray(field) && field.length > 0) {
          validationError.addStorefrontValidationMessage(field[1] ? field[1] : field[0], message)
        } else {
          throw new AddressValidationError(message)
        }
      })

      if (validationError.validationErrors.length > 0) {
        throw validationError
      }
    }
  }
}

module.exports = ShopifyStorefrontApi
