/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url, {
  useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
})
  // eslint-disable-next-line no-unused-vars
  .then((result) => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const voteSchema = new mongoose.Schema({
  username: {
    type: String, required: true,
  },
  ip: {
    type: String, required: true,
  },
  rating: {
    type: Number, required: true, min: 1, max: 5,
  },
  review: {
    type: String, required: true, minlength: 5, maxlength: 100,
  }
});

voteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Vote', voteSchema);
