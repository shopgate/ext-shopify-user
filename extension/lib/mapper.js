/**
 * Just maps the pipeline country input with Shopify's
 *
 * @param {string} [country] - country input
 * @returns {Object}
 */
module.exports.mapCountry = function (country) {
  const map = {}
  if (country.length === 2) {
    map.country_code = country
  } else if (country.length > 2) {
    map.country = country
  }
  return map
}

/**
 * @param {string} [province] - province | region input
 * @return {Object}
 */
module.exports.mapProvince = function (province) {
  if (!province || !province.length || province.length < 2) {
    return {}
  }

  const map = {}
  if (province.length === 2) {
    map.province_code = province
  } else if (province.length > 2) {
    map.province = province
  }

  return map
}

/**
 * Append customAttributes object to the address
 *
 * @param {ShopgateAddressCustomAttributes} [customAttributes]
 * @return {Object}
 */
module.exports.mapCustomAttributes = function (customAttributes) {
  const map = {}
  if (!customAttributes) {
    return map
  }
  if (customAttributes.company) {
    map.company = customAttributes.company
  }
  if (customAttributes.phone) {
    map.phone = customAttributes.phone
  }

  return map
}
