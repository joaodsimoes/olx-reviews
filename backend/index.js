/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Vote = require('./models/vote');

const app = express();
// MIDDLEWARE
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/votes', (request, response) => {
  Vote.find({}).then((votes) => response.send(votes));
});

app.get('/api/votes/ask/:username/:ip', (request, response) => { // returns true if ip has voted for username
  Vote.find({ username: request.params.username, ip: request.params.ip })
    .then((votes) => response.send(votes.length > 0));
});

app.get('/api/votes/username/:username', (request, response) => {
  Vote.find({ username: request.params.username }).then((votes) => response.send(votes));
});

app.get('/api/votes/ip/:ip', (request, response) => {
  Vote.find({ ip: request.params.ip }).then((votes) => response.send(votes));
});

app.post('/api/votes', (request, response, next) => {
  const { username, rating, review } = request.body;
  const ip = request.headers['x-forwarded-for'];

  const vote = new Vote({
    username,
    ip,
    rating,
    review,
  });

  Vote.find({ username, ip })
    .then((votes) => {
      if (votes.length === 0) {
        vote.save()
          .then((savedVote) => response.json(savedVote))
          .catch((error) => next(error));
      } else {
        response.status(409).send('You already voted!');
      }
    });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send(error.message);
  }
  if (error.name === 'MongoError') {
    return response.status(409).send(error.message);
  }

  next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
