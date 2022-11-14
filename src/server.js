const express = require('express');
const { userRouter, showRouter } = require('./routes');
const { db } = require('./db/db');


const server = express(); // create server
const port = 3_000; // set the port to localhost:3000

// add json passer and midwares
server.use(express.json());
server.use('/sync', async _ => await db.sync({ force: true }));
server.use('/users', userRouter); // add handler for user routes
server.use('/shows', showRouter); // add handler for show routes

// // listen on port 3,000
// server.listen(port, async () => {
//   console.log(`Listening on port ${port}`);
//   await db.sync({ force: true });
// });

module.exports = server; // export server
