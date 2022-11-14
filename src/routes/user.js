const { Router } = require('express');
const { User } = require("../models");
const { body, validationResult } = require('express-validator');

// create router
const userRouter = Router();
const statusCodes = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
};

// Define midwears
const getUserIfUserExistsElseThrowNotFound = async (req, res, next) => {
  let condition = {
    ...(req.body.id && { id: req.body.id }),
    ...(req.body.username && { username: req.body.username }),
    ...(req.body.password && { password: req.body.password })
  };

  const user = condition && await User.findOne(
    { where: condition }, { validate: true }
  );
  if (!user) return res
    .status(statusCodes['notFound'])
    .send({ error: `No user has user: ${req.body}` });

  req.user = user;
  next();
};

const getShowsIfShowsExistsElseThrowNotFound = async (req, res, next) => {
  const shows = await req.user.getShows();
  if (!shows) return res
    .status(statusCodes['notFound'])
    .send({ error: `User has no show: ${req.body}` });

  req.shows = shows;
  next();
};

const updateShowIfShowExistElseCreateShow = async (req, res, next) => {
  const showExists = await req.shows.find(
    show =>
      show.title === req.body.show.title &&
      show.genre === req.body.show.genre
  );

  if (showExists) showExists.set(req.body.show);
  else req.user.createShow(req.body.show);
  next();
};

const userValidator = async (req, res, next) => {
  // check if there are any errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res
    .status(statusCodes['badRequest'])
    .send({ errors: errors.array() });

  next();
};

/**
 * GET route on /users/
 * - returns all users
 */
userRouter.get('/', async (_, res) => {
  const users = await User.findAll();
  res.status(statusCodes['ok']).send(users);
});

/**
 * GET route on /users/user/
 * - request body contains username
 * - request body contains password
 * - returns a user object
 *
 * validate:
 * - request body has
 *    username: string
 *    password: string
 * - user exist with username and password
 */
userRouter.get(
  '/user',
  body().not().isEmpty(),
  body('username').exists(),
  body('password').exists(),
  body('username').isAlphanumeric(),
  body('password').isAlphanumeric(),
  getUserIfUserExistsElseThrowNotFound,
  userValidator,
  async (req, res) => {
    res
      .status(statusCodes['ok'])
      .send(req.user);
  }
);

/**
 * GET route on /users/user/shows/
 * - request body contains user (id)
 * - returns an array of show objects
 *
 * validate:
 * - request body has user (id): number
 */
userRouter.get(
  '/user/shows',
  body().not().isEmpty(),
  body('id')
    .exists()
    .isNumeric(),
  getUserIfUserExistsElseThrowNotFound,
  getShowsIfShowsExistsElseThrowNotFound,
  userValidator,
  async (req, res) => {
    console.log(req.body);
    res
      .status(statusCodes['ok'])
      .send(req.shows);
  }
);

/**
 * PUT route on /users/user/shows/
 * - request body contains user (id)
 * - request body contains (show) detail
 *
 * validate:
 * - request body has user (id): number
 * - request body had (show) detail: object
 *    (show) detail validate:
 *    - show has title
 *    - show has genre
 *    - show has rating
 *    - show has status
 */
userRouter.put(
  '/user/shows',
  body().not().isEmpty(),
  body('id')
    .exists()
    .isNumeric(),
  body('show')
    .exists()
    .not().isEmpty()
    .custom((show, _) =>
      show.title &&
      show.genre &&
      show.rating &&
      show.status
    ),
  getUserIfUserExistsElseThrowNotFound,
  getShowsIfShowsExistsElseThrowNotFound,
  updateShowIfShowExistElseCreateShow,
  userValidator,
  async (req, res) => {
    res.sendStatus(statusCodes['created']);
  }
)


// export user router
module.exports = userRouter;
