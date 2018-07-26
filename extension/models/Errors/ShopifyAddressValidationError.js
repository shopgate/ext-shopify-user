const ESHOPIFYADDRESSVALIDATIONERROR = 'ESHOPIFYADDRESSVALIDATIONERROR'

class ShopifyAddressValidationError extends Error {
  constructor (message) {
    super('has already been taken.')
    this.code = ESHOPIFYADDRESSVALIDATIONERROR
    this.message = message
  }
}

module.exports = ShopifyAddressValidationError
