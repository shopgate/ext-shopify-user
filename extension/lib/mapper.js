/**
 * Just maps the pipeline country input with Shopify's
 *
 * @param {string} [country] - country input
 * @returns {Object}
 */
module.exports.mapCountry = function (country) {
  const map = country && {
    ...(country.length === 2 && {countryCode: country}),
    ...(country.length > 2 && {country})
  }
  return map || {}
}

/**
 * @param {string} [province] - province | region input
 * @return {Object}
 */
module.exports.mapProvince = function (province) {
  const map = province && {
    ...(province.length === 2 && {provinceCode: province}),
    ...(province.length > 2 && {province: province})
  }
  return map || {}
}
