import { API_PATH } from "../../src/assets/apiPath"
import { expect } from "chai"


const apiBase = "http://localhost:8080"

describe('The Home Page', () => {
  beforeEach(() => {

    cy.request({
      method: "POST",
      url: `${apiBase}${API_PATH.USER_LOGIN}`,
      body: {
        email: "terashiM42@test.com",
        password: "terashiM42@test.com"
      },
      failOnStatusCode: false
    }).then(res => {
      expect(res.status).to.equal(200)

    })
  })

  it('successfully loads', () => {
    // cy.visit("/")
    cy.visit("/admin/match_edit")
  })

})

// 'POST', `http://localhost:8080${API_PATH.USER_LOGIN}`, { email: "terashiM42@test.com", password: "terashiM42@test.com" })
//       .its('body')
//   .as('currentUser').then(() => {
//     cy.visit('/')
//   }