const crypto = require('crypto')

let token, encryptionKey, signingKey

/**
 * @param {string} storeDomain
 * @param {string} shopifyMultipassToken
 * @param {string} email
 * @param {string} remoteIp
 * @param {string} returnTo
 */
module.exports = (storeDomain, shopifyMultipassToken, email, remoteIp, returnTo) => {
  if (token !== shopifyMultipassToken || !encryptionKey || !signingKey) initKeys(shopifyMultipassToken)

  const params = JSON.stringify({
    email,
    remote_ip: remoteIp,
    return_to: returnTo,
    created_at: new Date().toISOString()
  })

  const encryptedParams = encrypt(params)
  const signature = sign(encryptedParams)

  const loginToken = Buffer.concat([encryptedParams, signature]).toString('base64')
    .replace(/\+/g, '-') // URL-safe base64, replacing + and / with - and _
    .replace(/\//g, '_')

  return storeDomain + '/account/login/multipass/' + loginToken
}

function initKeys (shopifyMultipassToken) {
  const hash = crypto.createHash('sha256').update(shopifyMultipassToken).digest()
  token = shopifyMultipassToken
  encryptionKey = hash.subarray(0, 16)
  signingKey = hash.subarray(16, 32)
}

function encrypt (params) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, iv)

  return Buffer.concat([iv, cipher.update(params, 'utf8'), cipher.final()])
}

function sign (encryptedParams) {
  return crypto.createHmac('sha256', signingKey).update(encryptedParams).digest()
}
