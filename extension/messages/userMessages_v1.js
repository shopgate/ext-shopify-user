const Message = require('../models/messages/message')

function addSuccessMessage (inputMessage) {
  const message = new Message()
  message.addSuccessMessage(inputMessage.code, inputMessage.message)
  return message.toJson()
}

function addInfoMessage (inputMessage) {
  const message = new Message()
  message.addInfoMessage(inputMessage.code, inputMessage.message)
  return message.toJson()
}

function addErrorMessage (inputMessage) {
  const message = new Message()
  message.addErrorMessage(inputMessage.code, inputMessage.message)
  return message.toJson()
}

/**
 * General handler for messages. Creates a new Message object for each message present in input.messages
 * @param context
 * @param input
 * @param cb
 */
module.exports = function (context, input, cb) {
  let messages = []
  input.messages.forEach(function (inputMessage) {
    const message = new Message()

    switch (inputMessage.type) {
      case message.TYPE_INFO:
        messages.push(addInfoMessage(inputMessage))
        break
      case message.TYPE_ERROR:
        messages.push(addErrorMessage(inputMessage))
        break
      case message.TYPE_SUCCESS:
        messages.push(addSuccessMessage(inputMessage))
        break
      default:
        messages.push(addInfoMessage(inputMessage))
        break
    }

    cb(null, {messages: messages})
  })
}
