const Tools = require('../lib/tools')
const Message = require('../models/messages/message')

module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  const checkoutId = input.id
  const customerId = input.user.id
  const customerEmail = context.meta.userId
  const messages = []

  let error = null

  /* Get the checkout by checkoutId */
  Shopify.get('/admin/checkouts/' + checkoutId + '.json', {}, function (err, response) {
    if (err) {
      error = err
    }

    const checkout = response.checkout

    /* Check if the checkout is already owned by a customer */
    if (!Tools.objectIsEmpty(checkout.email) || !Tools.objectIsEmpty(checkout.customer_id)) {
      error = true
      const errorMessage = new Message()
      errorMessage.addErrorMessage('no code', 'Checkout already owned by a customer')
      messages.push(errorMessage.toJson())
    }

    if (!error) {
      const updateCheckoutData = {
        'checkout': {
          'customer_id': customerId,
          'email': customerEmail
        }
      }

      Shopify.put('/admin/checkouts/' + checkoutId + '.json', updateCheckoutData, function (err) {
        if (err) {
          messages.push(err)
        }

        if (error) {
          cb(null, {
            success: false,
            messages: messages
          })
        } else {
          cb(null, {
            success: 'ok',
            messages: []
          })
        }
      })
    } else {
      cb(null, {
        success: false,
        messages: messages
      })
    }
  })
}
