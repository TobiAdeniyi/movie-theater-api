const request = require('supertest');
const server = require('../../src/routes/user');
const { User } = require('../../src/models/index');

const statusCodes = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
};

describe('Server methods on User routs', () => {
  let userDetails;
  let showDetails;

  beforeEach(async () => {
    userDetails = {
      username: 'Tom_Scott@example.com',
      password: 'password'
    };
    showDetails = [
      {
        title: 'two and a half men',
        genre: 'Comedy',
        rating: 7,
        status: 'watching'
      }
    ];

    await User.sync({ force: true });
    const usr = await User.create(userDetails, { validate: true });
    usr.setShows(showDetails);
  });

  describe('GET /users', () => {
    let res; // response from GET on /users

    beforeEach(async () => {
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
      expect(!res.body).toBeTruthy(); // object is not empty
      expect(res.body).toBeMatch(userDetails); // body contains the correct values
    });
  });


  describe('GET /user', () => {
    describe('with valid details', () => {
      let res; // response from GET on /user

      beforeEach(async () => {
        res = await request(server)
          .get('/user')
          .send(userDetails);
      });

      test('succeeds', async () => {
        expect(res.statusCode).toBe(statusCodes['ok']);
      });

      test('responds formatted as application/json', async () => {
        expect(res.headers['content-type']).toMatch('application/json');
      });

      test('responds with the correct user', async () => {
        expect(!res.body).toBeTruthy(); // body is not empty
        expect(async () => {
          const user = await User.findOne({ where: res.body });
          return { username: user.username, password: user.password };
        }).toEqual(userDetails);
      });
    });

    describe('with invalid details', () => {
      test('invalid user - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .get('/user')
          .send({
            username: 'name does not exist',
            password: 'password123'
          });
        expect(statusCode).toBe(statusCodes['notFound']);
      });

      test('invalid password - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .get('/user')
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
          .get('/user')
          .send({ username: userDetails.username });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing password - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .get('/user')
          .send({ password: userDetails.password });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });
  });

  describe('GET /user/shows', () => {
    describe('with valid details', () => {
      let res; // response from GET on /user/shows

      beforeEach(async () => {
        res = await request(server)
          .get('/user/shows')
          .send({ userId: 1 });
      });

      test('succeeds', () => {
        expect(res.statusCode).toBe(statusCodes['ok']);
      });

      test('responds formatted as application/json', () => {
        expect(res.headers['content-type']).toMatch('application/json');
      });

      test('responds with an array of shows', () => {
        expect(Array.isArray(res.body)).toBeTruthy(); // body is an array
        expect(!res.body).toBeTruthy(); // body is not empty
        expect(res.body).toMatch(showDetails); // body contains the correct values
      });
    });

    describe('with invalid details', () => {
      test('invalid userId - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .get('/user/shows')
          .send({ userId: 100 });
        expect(statusCode).toBe(statusCodes['notFound']);
      });
    });

    describe('with a missing details', () => {
      test('missing userId - fail with Bad Request', async () => {
        const { statusCode } = await request(server)
          .get('/user/shows')
          .send({});
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });
  });

  describe('PUT /user/show', () => {
    let req;
    let show;

    const userId = 1;
    const title = 'doctor who';
    const genre = 'Drama';
    const rating = 9;
    const status = 'finished';


    beforeEach(async () => {
      show = { title, genre, rating, status }
      req = await req(server)
        .put('/user/shows')
        .send({ userId, show });
    });

    describe('with valid details', () => {
      test('succeeds', () => {
        expect(res.statusCode).toBe(statusCodes['created']);
      });

      test('updates the users shows', () => {
        expect(res.headers['content-type']).toMatch('application/json');
      });
    });

    describe('with invalid details', () => {
      test('invalid userId - fails with Not Found', async () => {
        const { statusCode } = await req(server)
          .put('/user/shows')
          .send({ userId: 100, show });
        expect(statusCode).toBe(statusCodes['notFound']);
      });

      test('invalid show - fails with Not Found', async () => {
        const { statusCode } = await req(server)
          .put('/user/shows')
          .send({
            userId,
            show: { unexpected_attibute: null, title, genre, rating, statu }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });

    describe('with a missing details', () => {
      test('missing userId - fail with Bad Request', async () => {
        const { statusCode } = await req(server)
          .put('/user/shows')
          .send({ show: { title, genre, rating, status } });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing show title - fail with Bad Request', async () => {
        const { statusCode } = await req(server)
          .put('/user/shows')
          .send({
            userId, show: { genre, rating, status }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing shows genre - fail with Bad Request', async () => {
        const { statusCode } = await req(server)
          .put('/user/shows')
          .send({
            userId, show: { title, rating, status }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing shows rating - fail with Bad Request', async () => {
        const { statusCode } = await req(server)
          .put('/user/shows')
          .send({
            userId, show: { title, genre, status }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });

      test('missing shows status - fail with Bad Request', async () => {
        const { statusCode } = await req(server)
          .put('/user/shows')
          .send({
            userId, show: { title, genre, rating }
          });
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });
  });
});
