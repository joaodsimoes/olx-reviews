/* global chrome */
import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { Rating } from '@material-ui/lab';
import axios from 'axios';
import 'fontsource-roboto';

const addReview = 'https://serene-shelf-97342.herokuapp.com/api/votes'
const getReviews = 'https://serene-shelf-97342.herokuapp.com/api/votes/username/'
const Titulo = () => {
  return (
    <Typography variant="h6" component="h6">
      OLX Reviews
    </Typography>
  )
}

const Info = ({ message, info }) => {
  return (
    <div>
      <Typography variant="subtitle2" component="subtitle2">
        {message}: <strong>{info}</strong>
      </Typography>
    </div>
  )
}

const UserRating = ({ stars }) => {
  return (
    <div>
      <Typography variant="subtitle2" component="subtitle2">
        Score:
      </Typography>
      <div
        style={{
          position: 'fixed', left: '50%', top: '60%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Rating name="read-only" value={stars} size="small" precision={0.25} readOnly />
      </div>
    </div>
  )

}

const Message = ({ message }) =>{
return(
  <div style= {{marginTop: "30px"}}>
    <p style={{ textAlign: "center" }}>{message}</p>
  </div>
)}
function App() {
  const [value, setValue] = useState(0);
  const [hasVoted, setVoted] = useState(false);
  const [message, setMessage] = useState('Deixa a tua review!');
  const [username, setUsername] = useState(null);
  const [rating, setRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(null);


  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const url = JSON.stringify(tabs[0].url);
      const currentUser = url.split('/')[5];
      setUsername(currentUser);
      axios.get(getReviews + currentUser)
        .then((reviews) => {
          const reviewArray = reviews.data;
          let sum = 0;
          reviewArray.forEach((review) => sum += review.rating)
          setTotalVotes(reviewArray.length);
          const denominator = reviewArray.length === 0 ? 1 : reviewArray.length; //to avoid dividing by zero
          setRating(sum / denominator);
        })

    });


  }, []);

  return (
    <div>
      <Titulo />
      <Info message={"Username"} info={username} />
      <Info message={"Total de votos"} info={totalVotes} />
      <UserRating stars={rating} />
      <Message message={message} />
      <Rating
        name="hover-feedback"
        value={value}
        precision={1}
        onChange={(event, newValue) => {
          if (!hasVoted) {
            setValue(newValue);
            const voteObject = { username, rating: newValue }
            axios
              .post(addReview, voteObject)
              .then(response => {
                setVoted(true);
                const newRating = ((rating * totalVotes) + newValue) / (totalVotes + 1)
                setRating(newRating);
                setTotalVotes(totalVotes + 1);
                setMessage(`Votaste com ${newValue} estrelas!`);
                setTimeout(() => setMessage('Obrigado por votares!'), 3000);
              }).catch(error => setMessage('Já votaste neste utilizador!'))

          }
        }
        } />
    </div>

  );
}

export default App;
