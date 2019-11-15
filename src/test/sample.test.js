const request = require('supertest')
const userServices = require('../services/user')
const app = require('../server')


describe('Test Functions', () => {
  it('should get all users', async () => {
    const test = userServices.getUsers();
    expect(test.statusCode).toEqual(500)
  })
})


describe('Sample Test', () => {
    it('should test that true === true', () => {
      expect(true).toBe(true)
    })
  })