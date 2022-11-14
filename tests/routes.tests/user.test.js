const request = require('supertest');
const server = require('../../src/server');
const { User, Show } = require('../../src/models/index');
const { statusCodes } = require('../../src/utils/utils');
const { userDetails, showDetails } = require('../../src/utils/demoData');


describe('Server methods on User routes', () => {

  describe('GET /users', () => {
    let res; // response from GET on /users

    beforeEach(async () => {
      await User.sync({ force: true });
      await User.create(userDetails, { validate: true });
      res = await request(server).get('/users');
    });

    test('succeeds', () => {
      expect(res.statusCode).toBe(statusCodes['ok']);
    });

    test('responds formatted as application/json', () => {
      expect(res.headers['content-type']).toMatch('application/json');
    });

    test('responds with an array of users', () => {
      expect(Array.isArray(res.body)).toBeTruthy(); // body is an array
      expect(res.body.map(({ username, password }) => {
        return { username, password };
      })).toEqual([userDetails]); // body contains the correct values
    });
  });


  describe('GET /users/user', () => {
    describe('with valid details', () => {
      let res; // response from GET on /user

      beforeEach(async () => {
        res = await request(server)
          .get('/users/user')
          .send(userDetails);
      });

      test('succeeds', () => {
        expect(res.statusCode).toBe(statusCodes['ok']);
      });

      test('responds formatted as application/json', () => {
        expect(res.headers['content-type']).toMatch('application/json');
      });

      test('responds with the correct user', () => {
        expect(res.body).toBeTruthy(); // body is not empty
        const { username, password } = res.body;
        expect({ username, password }).toEqual(userDetails);
      });
    });

    describe('with invalid details', () => {
      test('invalid user - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .get('/users/user')
          .send({
            username: 'name does not exist',
            password: 'password123'
          });
        expect(statusCode).toBe(statusCodes['notFound']);
      });

      test('invalid password - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .get('/users/user')
          .send({
            username: userDetails.username,
            password: 'password123'
          });
        expect(statusCode).toBe(statusCodes['notFound']);
      });
    });

    describe('with a missing details', () => {
      test('missing username - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .get('/users/user')
          .send({ username: userDetails.username });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing password - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .get('/users/user')
          .send({ password: userDetails.password });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });
  });

  describe('GET /users/user/shows', () => {
    describe('with valid details', () => {
      let res; // response from GET on /user/shows

      beforeEach(async () => {
        await Show.sync({ force: true });
        const user = await User.findByPk(1);
        showDetails.forEach(async showDetail => {
          await user.createShow(showDetail);
        });
        res = await request(server)
          .get('/users/user/shows')
          .send({ id: 1 });
      });

      test('succeeds', () => {
        expect(res.statusCode).toBe(statusCodes['ok']);
      });

      test('responds formatted as application/json', () => {
        expect(res.headers['content-type']).toMatch('application/json');
      });

      test('responds with an array of shows', () => {
        expect(Array.isArray(res.body)).toBeTruthy(); // body is an array
        expect(res.body.map(
          ({ title, genre, rating, status, userId }) => {
            return { title, genre, rating, status, userId };
          })).toEqual(showDetails); // body contains the correct values
      });
    });

    describe('with invalid details', () => {
      test('invalid id - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .get('/users/user/shows')
          .send({ id: 100 });
        expect(statusCode).toBe(statusCodes['notFound']);
      });
    });

    describe('with a missing details', () => {
      test('missing id - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .get('/users/user/shows')
          .send({});
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });
  });

  describe('PUT /users/user/shows', () => {
    let res;
    let show;

    const id = 1;
    const title = 'doctor who';
    const genre = 'Drama';
    const rating = 9;
    const status = 'finished';

    beforeEach(async () => {
      // await Show.sync({ force: true });
      await User.create(userDetails, { validate: true });
      show = { title, genre, rating, status }
      res = await request(server)
        .put('/users/user/shows')
        .send({ id, show });
    });

    describe('with valid details', () => {
      test('succeeds', () => {
        expect(res.statusCode).toBe(statusCodes['created']);
      });
    });

    describe('with invalid details', () => {
      test('invalid id - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .put('/users/user/shows')
          .send({ id: 100, show });
        expect(statusCode).toBe(statusCodes['notFound']);
      });

      test('invalid show - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .put('/users/user/shows')
          .send({
            id,
            show: { unexpected_attibute: null }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });

    describe('with a missing details', () => {
      test('missing id - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .put('/users/user/shows')
          .send({ show: { title, genre, rating, status } });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing show title - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .put('/users/user/shows')
          .send({
            id, show: { genre, rating, status }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing shows genre - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .put('/users/user/shows')
          .send({
            id, show: { title, rating, status }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing shows rating - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .put('/users/user/shows')
          .send({
            id, show: { title, genre, status }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing shows status - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .put('/users/user/shows')
          .send({
            id, show: { title, genre, rating }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });
  });
});
