module.exports =  function decodeJwt (idToken) {
  const [header, payload, signature] = idToken.split('.')

  const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString())
  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())

  return {
    header: decodedHeader,
    payload: decodedPayload,
    signature,
  }
}
