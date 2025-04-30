module.exports = `
{
  customer {
    id
    firstName
    lastName
    phoneNumber {
      phoneNumber
    }
    emailAddress {
      emailAddress
    }
    companyContacts (first: 1) {
      edges {
        node {
          id
          company {
            name
          }
          locations (first: 1) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    }
  }
}
`
