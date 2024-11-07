module.exports =  function decodeJwt (idToken) {
  const [, payload] = idToken.split('.')

  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())

  return { payload: decodedPayload }
}
