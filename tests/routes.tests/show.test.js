const request = require("supertest");
const { User, Show } = require("../../src/models");
const server = require("../../src/server");
const { showDetails } = require("../../src/utils/demoData");
const { statusCodes } = require("../../src/utils/utils");


describe('Server methods on Show routes', () => {
  const showDetail = showDetails[0];
  const showRating = showDetail['rating'];
  const showStatus = showDetail['status'];
  const showTitle = showDetail['title'];
  const showGenre = showDetail['genre'];
  const showId = 1;

  describe('GET /shows', () => {
    let res; //responsse from GET on /shows

    beforeEach(async () => {
      await Show.sync({ force: true });
      await Show.create(showDetail, { validate: true });
      res = await request(server).get('/shows');
    });

    test('succeeds', () => {
      expect(res.statusCode).toBe(statusCodes['ok']);
    });

    test('responds formatted as application/json', () => {
      expect(res.headers['content-type']).toMatch('application/json');
    });

    test('responds with an array of shows', () => {
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.map(({ title, genre, rating, status }) => {
        return { title, genre, rating, status };
      })).toEqual([showDetail]);
    });

    describe('shows of a particular genre', () => {
      describe('with valid details', () => {
        beforeEach(async () => {
          res = await request(server).get(`/shows/${showGenre}`);
        });

        test('succeeds', () => {
          expect(res.statusCode).toBe(statusCodes['ok']);
        });

        test('responds formatted as application/json', () => {
          expect(res.headers['content-type']).toMatch('application/json');
        });

        test('responds with an array of shows', () => {
          expect(Array.isArray(res.body)).toBeTruthy(); // body is an array
          const [{ title, genre, rating, status }] = res.body;
          expect([{ title, genre, rating, status }]).toEqual([showDetail]);
        });
      });

      describe('failure', () => {
        test('no shows for given genre', async () => {
          res = await request(server).get('/shows/Horror');
          expect(res.statusCode).toBe(statusCodes['notFound']);
        });

        test('genre does not exist', async () => {
          res = await request(server).get('/shows/does-not-exist');
          expect(res.statusCode).toBe(statusCodes['badRequest']);
        });
      });
    });
  });


  describe('GET /shows/show', () => {
    let res; //responsse from GET on /shows

    beforeEach(async () => {
      await Show.sync({ force: true });
      await Show.create(showDetail, { validate: true });
      res = await request(server).get('/shows');
    });

    describe('with valid details', () => {
      let res; // response from GET on /shows/show

      beforeEach(async () => {
        res = await request(server)
          .get('/shows/show')
          .send({ id: showId });
      });

      test('succeeds', () => {
        console.log(showId);
        expect(res.statusCode).toBe(statusCodes['ok']);
      });

      test('responds formatted as application/json', () => {
        expect(res.headers['content-type']).toMatch('application/json');
      });

      test('responds with the cortitle', () => {
        expect(res.body).toBeTruthy(); // body is not empty
        const { title, genre, rating, status } = res.body;
        expect({ title, genre, rating, status }).toEqual(showDetail);
      });
    });

    describe('with invalid details', () => {
      test('invalid showId - fails with Not Found', async () => {
        const { statusCode } = await request(server)
          .get('/shows/show')
          .send({ id: 1_000 });
        expect(statusCode).toBe(statusCodes['notFound']);
      });
    });

    describe('with missing details', () => {
      test('missing showId - fails with Bad Request', async () => {
        const { statusCode } = await request(server)
          .get('/shows/show')
          .send({});
        expect(statusCode).toBe(statusCodes['badRequest']);
      });
    });
  });
});
