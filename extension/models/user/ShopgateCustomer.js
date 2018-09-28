class ShopgateCustomer {
  /**
   * @param {string} id
   * @param {string} mail
   * @param {string} firstName
   * @param {string} lastName
   * @param {string|null} phone
   */
  constructor (id, mail, firstName, lastName, phone = null) {
    this.id = id
    this.mail = mail
    this.firstName = firstName
    this.lastName = lastName
    this.phone = phone
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
      shopifyCustomer.phone
    )
  }
}

module.exports = ShopgateCustomer
