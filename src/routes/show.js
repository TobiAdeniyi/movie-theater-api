const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const { Show } = require("../models");
const { statusCodes } = require("../utils/utils");

// create router
const showRouter = Router();

// define midwears
const getGenreIfGenreIsAllowed = (req, res, next) => {
  const genre = req.params.genre;
  const genres = ['Comedy', 'Drama', 'Horror', 'Sitcom'];
  const genreIsNotAllowed = !genres.some(
    g => g.toLowerCase() == genre.toLowerCase()
  );
  if (genreIsNotAllowed) res
    .status(statusCodes['badRequest'])
    .send({ error: `Genre must be one of the following: ${genres}` });

  req.body = req.body || {};
  req.body.genre = genre;
  next();
};

const getShowIfShowExistsElseThrowNotFound = async (req, res, next) => {
  let condition = {
    ...(req.body.id && { id: req.body.id }),
    ...(req.body.title && req.body.genre && { id: req.body.title }),
    ...(req.body.title && req.body.genre && { id: req.body.genre }),
  };

  const show = condition && await Show.findOne(
    { where: condition }, { validator: true }
  );
  if (!show) return res
    .status(statusCodes['notFound'])
    .send({ error: `No show exist for ${req.body}` });

  req.show = show;
  next();
};

const getShowsIfShowsExistsElseThrowNotFound = async (req, res, next) => {
  let where = {
    ...(req.body.id && { id: req.body.id }),
    ...(req.body.title && { title: req.body.title }),
    ...(req.body.genre && { genre: req.body.genre }),
    ...(req.body.rating && { rating: req.body.rating }),
    ...(req.body.status && { status: req.body.status }),
  };

  const shows = where === {} ?
    [] : (await Show.findAll({ where }, { validator: true }));

  if (!shows || Object.keys(shows).length === 0) return res
    .status(statusCodes['notFound'])
    .send({ error: `No shows exist for ${req.body}` });

  req.shows = shows;
  next();
};

const showValidator = async (req, res, next) => {
  // check if there were any errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res
    .status(statusCodes['badRequest'])
    .send({ errors: errors.array() });

  next();
};

/**
 * GET route on /shows/
 * - returns all shows
 */
showRouter.get('/', async (_, res) => {
  const shows = await Show.findAll();
  res
    .status(statusCodes['ok'])
    .send(shows);
});

/**
 * GET route on /shows/show/
 * - request body contains show (id)
 * OR
 * - request body contains title
 * - request body contains genre
 */
showRouter.get(
  '/show',
  body()
    .exists()
    .not().isEmpty(),
  body('id')
    .exists()
    .isNumeric(),
  getShowIfShowExistsElseThrowNotFound,
  showValidator,
  (req, res) => {
    res
      .status(statusCodes['ok'])
      .send(req.show);
  }
);

/**
 * GET route on /shows/:genre/
 * - returns all shows that fall under the genre
 */
showRouter.get(
  '/:genre',
  getGenreIfGenreIsAllowed,
  getShowsIfShowsExistsElseThrowNotFound,
  showValidator,
  (req, res) => {
    res
      .status(statusCodes['ok'])
      .send(req.shows);
  }
);

module.exports = showRouter;
