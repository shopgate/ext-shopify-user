/**
 * @return {Promise<Object>}
 */
module.exports = async () => ({
  addressDefaultGroups: ['default'],
  userMenuEntries: {
    addressBook: true,
    accountProfile: false
  },
  addressForm: {
    fields: {
      city: {
        type: 'text',
        label: 'City',
        sortOrder: 6
      },
      custom: {
        phone: {
          type: 'phone',
          label: 'Phone',
          sortOrder: 10
        },
        company: {
          type: 'text',
          label: 'Company',
          sortOrder: 3
        }
      },
      country: {
        type: 'country',
        label: 'Country',
        countries: [
          'DE',
          'US',
          'AT',
          'FR',
          'GB'
        ],
        sortOrder: 7
      },
      street1: {
        type: 'text',
        label: 'Address1',
        sortOrder: 4
      },
      street2: {
        type: 'text',
        label: 'Address2',
        sortOrder: 5
      },
      zipCode: {
        type: 'text',
        label: 'Postal/Zip Code',
        sortOrder: 9
      },
      lastName: {
        type: 'text',
        label: 'Last Name',
        sortOrder: 2
      },
      province: {
        type: 'province',
        label: 'Province',
        actions: [
          {
            type: 'setVisibility',
            rules: [
              {
                data: [
                  'US',
                  'DE'
                ],
                type: 'oneOf',
                context: 'country'
              }
            ]
          }
        ],
        required: true,
        sortOrder: 8
      },
      firstName: {
        type: 'text',
        label: 'First Name',
        sortOrder: 1
      }
    }
  }
})
