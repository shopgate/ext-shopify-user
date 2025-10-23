/**
 * @namespace CustomerLinks
 */

/**
 * @typedef {Object} CustomerLinks.CustomerLink
 * @property {string} key - a key to identify the DOM element
 * @property {boolean} show if true, will display the link
 * @property {string} label link label
 * @property {string} target URL to redirect to, can start with HTTPS or can follow SW6 redirectTo schema
 * @property {string} icon the icon class to be used (one of: AccountBoxIcon, BoxIcon, InfoIcon, BookIcon, ChartIcon)
 */

/**
 * @typedef {Object} CustomerLinks.Config
 * @property {CustomerLink[]} customerLinks
 */
