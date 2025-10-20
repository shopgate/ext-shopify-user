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
var content = '<path xmlns="http://www.w3.org/2000/svg" d="m 2.2526,5.7943 l 0,12.9957 c 3.249,-2.03 6.498,-2.03 9.7474,0 c 3.249,-2.03 6.498,-2.03 9.747,0 l 0,-12.9957 C 18.498,3.7637 15.249,3.7637 12,5.7943 c -3.2793,-1.9405 -6.8503,-1.7762 -9.7474,0 z m 8.1224,1.726 l 0,8.0207 C 8.3081,14.851 6.4129,14.674 4.537,15.389 l 0,-8.2239 c 2.287,-1.0085 4.48,-0.5243 5.838,0.3552 z m 9.088,-0.3552 l 0,8.2239 c -2.297,-0.718 -4.023,-0.457 -5.839,0.152 l 0,-8.0207 c 1.866,-1.0392 3.67,-1.3169 5.839,-0.3552 z" id="book" style="fill:#747474;fill-opacity:1;stroke:none"/>'

/**
 * The description icon component.
 * @param {Object} props The icon component properties.
 * @returns {JSX}
 */
var BookIcon = function AccountBox (props) {
  return _react2.default.createElement(_Icon2.default, _extends({ content: content }, props))
}

exports.default = BookIcon
