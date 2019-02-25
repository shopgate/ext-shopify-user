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
   * @param {ShopifyCustomer} shopifyCustomer
   * @return {ShopgateCustomer}
   */
  static fromShopifyCustomer (shopifyCustomer) {
    return new ShopgateCustomer(
      Buffer.from(shopifyCustomer.id, 'base64').toString().substring(23),
      shopifyCustomer.email,
      shopifyCustomer.firstName,
      shopifyCustomer.lastName,
      {
        phone: shopifyCustomer.phone
      }
    )
  }
}

module.exports = ShopgateCustomer
