class ShopgateCustomer {
  /**
   * @param {string} id
   * @param {string} mail
   * @param {string} firstName
   * @param {string} lastName
   * @param {ShopgateUserCustomAttributes} customAttributes
   * @param {ShopgateUserGroups[]} userGroups
   */
  constructor (id, mail, firstName, lastName, customAttributes, userGroups = []) {
    this.id = id
    this.mail = mail
    this.firstName = firstName
    this.lastName = lastName
    this.customAttributes = customAttributes
    this.userGroups = userGroups
  }

  /**
   * @param {ShopifyStorefrontApiCustomer} shopifyCustomer
   * @return {ShopgateCustomer}
   */
  static fromShopifyStorefrontApiCustomer (shopifyCustomer) {
    return new ShopgateCustomer(
      ShopgateCustomer._extractNumericCustomerId(shopifyCustomer.id),
      shopifyCustomer.email,
      shopifyCustomer.firstName,
      shopifyCustomer.lastName,
      {
        phone: shopifyCustomer.phone
      }
    )
  }

  /**
   *
   * @param {ShopifyCustomerAccountApiCustomer} shopifyCustomer
   * @return ShopgateCustomer
   */
  static fromShopifyCustomerAccountApiCustomer (shopifyCustomer) {
    return new ShopgateCustomer(
      ShopgateCustomer._extractNumericCustomerId(shopifyCustomer.id),
      (shopifyCustomer.emailAddress || {}).emailAddress,
      shopifyCustomer.firstName,
      shopifyCustomer.lastName,
      {
        phone: shopifyCustomer.phoneNumber,
        shopifyCompanyContacts: ((shopifyCustomer.companyContacts || {}).edges || []).map(companyContact => ({
            id: companyContact.node.id,
            name: companyContact.node.company.name,
            locations: ((companyContact.node.locations || {}).edges || []).map(location => location.node)
        }))
      }
    )
  }

  /**
   * Cut off the prefix of "gid://shopify/Customer/" that is returned with every customer ID from Shopify GraphQL API.
   *
   * @param shopifyCustomerId
   * @returns {string}
   * @private
   */
  static _extractNumericCustomerId (shopifyCustomerId) {
    return shopifyCustomerId.substring(23)
  }
}

module.exports = ShopgateCustomer
