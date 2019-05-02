# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
## [2.1.2] - 2019-05-01
### Fixed
- handling of expired tokens

## [2.1.1] - 2019-04-25
### Changed
- removed tokens that can not be refreshed from storage

## [2.1.0] - 2019-02-18
### Changed
- callbacks to use async instead
### Removed
- dependencies with Tools.js file
- unused admin api functions

## [2.0.0] - 2019-02-07
### Changed
- Updated Web Checkout to be compatible with Shopgate PWA version 6.1 and higher

## [1.4.0] - 2018-12-07
### Added
- pipeline for updating a customer

### Fixed
- company or phone could not be updated to empty strings

### Changed
- internally using `@shopgate/bigapi-requester` now instead of a custom implementation
- guest checkout now depends on the config 'guest_login_mode'

## [1.3.2] - 2018-10-15
### Fixed
- phone number was mapped to the "company" field when adding/updating addresses

### Changed
- Shopify request log format changed to be compatible with `shopify-cart`'s log format

## [1.3.1] - 2018-09-28
### Fixed
- error handling for Shopify API and validation errors
- customer not being redirected to app/web checkout after registration

### Added
- added customer address management synchronization

## [1.2.3] - 2018-08-30
### Fixed
- Fix bug that user can't login if the mail address contains capital letter

## [1.2.2] - 2018-08-30
### Added
- logging request duration and other info when requesting the Shopify API

## [1.1.5] - 2018-07-30
### Fixed
- user not logged in after registration in webcheckout

[Unreleased]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.2...HEAD
[2.1.2]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/shopgate/ext-shopify-user/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/shopgate/ext-shopify-user/compare/v1.4.0...v2.0.0
[1.4.0]: https://github.com/shopgate/ext-shopify-user/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/shopgate/ext-shopify-user/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/shopgate/ext-shopify-user/compare/v1.2.3...v1.3.1
[1.2.3]: https://github.com/shopgate/ext-shopify-user/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/shopgate/ext-shopify-user/compare/v1.1.5...v1.2.2
