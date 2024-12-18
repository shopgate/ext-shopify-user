# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [2.2.2] - 2024-12-18
### Fixed
- buyer IP not sent to Shopify on some login-related requests from the `@shopgate/shopify-cart` extension

## [2.2.1] - 2024-12-18
### Added
- sending the buyer IP along with Storefront API requests as per requirement by Shopify to maintain a consistent checkout experience

## [2.2.0] - 2024-11-07
### Added
- password-less login via Shopify Auth API and Customer Account API ("new customer accounts")
- enables usage of @shopgate/shopify-cart v3.0.0, utilizing Shopify Cart API over the deprecated Checkout API

### Changed
- uses Shopify API version 2024-10 on all endpoints

### Removed
- support for profile & address book features when using "new customer accounts" / password-less login

## [2.1.12] - 2023-10-30
### Changed
- uses Shopify API version 2023-10 on all endpoints

## [2.1.11] - 2023-06-30
### Changed
- uses Shopify API version 2022-10 on all endpoints

## [2.1.10] - 2023-01-06
### Fixed
- errors when logging in to the app due to how the Shopify returns data in newer API versions

## [2.1.9] - 2023-01-06
### Fixed
- randomly occurring errors when logging in

## [2.1.8] - 2022-12-29
### Fixed
- outdated storefront API tokens would not be properly renewed leading to log in errors

## [2.1.7] - 2022-12-29
### Fixed
- errors when logging in due to wrong usage of updated dependencies from 2.6.1

## [2.1.6] - 2022-12-29
### Changed
- updated vulnerable dependencies

### Fixed
- explicitly call Shopify API via versioned URL because otherwise the oldest version applies (internal fix)

## [2.1.5] - 2020-02-28
### Fixed
- removed auto-renewal of tokens (internal fix)

## [2.1.4] - 2019-10-01
### Fixed
- handling of expired sessions

## [2.1.3] - 2019-07-01
### Fixed
- autologin if a custom shopify domain is used

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
- user not logged in after registration in web checkout

[Unreleased]: https://github.com/shopgate/ext-shopify-user/compare/v2.2.2...HEAD
[2.2.2]: https://github.com/shopgate/ext-shopify-user/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/shopgate/ext-shopify-user/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.12...v2.2.0
[2.1.12]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.11...v2.1.12
[2.1.11]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.10...v2.1.11
[2.1.10]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.9...v2.1.10
[2.1.9]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.8...v2.1.9
[2.1.8]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.7...v2.1.8
[2.1.7]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.6...v2.1.7
[2.1.6]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.5...v2.1.6
[2.1.5]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/shopgate/ext-shopify-user/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/shopgate/ext-shopify-user/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/shopgate/ext-shopify-user/compare/v1.4.0...v2.0.0
[1.4.0]: https://github.com/shopgate/ext-shopify-user/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/shopgate/ext-shopify-user/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/shopgate/ext-shopify-user/compare/v1.2.3...v1.3.1
[1.2.3]: https://github.com/shopgate/ext-shopify-user/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/shopgate/ext-shopify-user/compare/v1.1.5...v1.2.2
[1.1.5]: https://github.com/shopgate/ext-shopify-user/compare/v1.1.4...v1.1.5
