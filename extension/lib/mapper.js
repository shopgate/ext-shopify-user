/**
 * Just maps the pipeline country input with Shopify's
 *
 * @param {string} [country] - country input
 *
 * @returns {Object}
 */
module.exports.mapCountry = function (country) {
  const map = country && {
    ...(country.length === 2 && {country_code: country}),
    ...(country.length > 2 && {country})
  }
  return map || {}
}

module.exports.mapProvince = function (province) {
  const map = province && {
    ...(province.length === 2 && {province_code: province}),
    ...(province.length > 2 && {province: province})
  }
  return map || {}
}
