'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i]
    for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key] } }
  }
  return target
}

var _react = require('react')

var _react2 = _interopRequireDefault(_react)

var _Icon = require('@shopgate/pwa-common/components/Icon')

var _Icon2 = _interopRequireDefault(_Icon)

function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj } }

// SVG Content
var content = '<g stroke="null" id="svg_1"><path stroke="null" id="svg_2" fill="#747474" clip-rule="evenodd" fill-rule="evenodd" d="m0,2.67499l0,18.72447c0,1.4708 1.20279,2.67499 2.67499,2.67499l18.72447,0c1.4708,0 2.67499,-1.20419 2.67499,-2.67499l0,-18.72447c0,-1.4708 -1.20419,-2.67499 -2.67499,-2.67499l-18.72447,0c-1.47221,0 -2.67499,1.20419 -2.67499,2.67499zm2.67499,0l18.72447,0l0,18.72447l-18.72447,0l0,-18.72447zm2.67499,6.68724l2.67498,0l0,9.36225l-2.67498,0l0,-9.36225zm5.34998,-4.01224l2.67499,0l0,13.37449l-2.67499,0l0,-13.37449zm5.34952,8.0245l2.675,0l0,5.34999l-2.675,0l0,-5.34999z" class="st1"/></g>'

/**
 * The description icon component.
 * @param {Object} props The icon component properties.
 * @returns {JSX}
 */
var ChartIcon = function AccountBox (props) {
  return _react2.default.createElement(_Icon2.default, _extends({ content: content }, props))
}

exports.default = ChartIcon
