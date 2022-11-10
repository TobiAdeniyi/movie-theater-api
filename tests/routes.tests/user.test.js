const request = require('supertest');
const server = require('../../src/routes/user');


describe('GET /user', () => {
  test('succeeds', async () => {

  });

  test('responds formatted as application/json', async () => {

  });

  test('responds with array of users', async () => {

  });
});


describe('GET /user/:id', () => {
  describe('with valid :id', () => {
    test('succeeds', async () => {

    });

    test('responds formatted as application/json', async () => {

    });

    test('responds with the correct user', async () => {

    });
  });

  describe('with invalid :id', () => {
    test('fails wit Not Found', async () => {

    });
  });
});
