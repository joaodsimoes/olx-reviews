/* global chrome */
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Banner } from 'material-ui-banner';
import React, { useState, useEffect } from 'react';
import { TextField, Typography, Button } from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import axios from 'axios';
import 'fontsource-roboto';

const addReview = 'https://serene-shelf-97342.herokuapp.com/api/votes'
const getReviews = 'https://serene-shelf-97342.herokuapp.com/api/votes/username/'
const defaultMessage = 'Deixa a tua review!';

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
          position: 'relative', left: '62%', top: '12px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Rating name="read-only" value={stars} size="small" precision={0.25} readOnly />
      </div>
    </div>
  )

}

const Message = ({ message }) => {
  return (
    <div style={{ marginTop: "10px" }}>
      <p style={{ textAlign: "center" }}>{message}</p>
    </div>
  )
}

const ShowReviews= ({reviews,showReviews}) => {
  if(showReviews){
    return(
      <ul>
        {reviews.map((e) => <li>{e.review} <strong>{e.rating}/5 </strong> </li>)}
      </ul>
    )
  }
  return null;
}

const Reviews = ({ reviews }) => {
  const [showReviews, setShowReviews] = useState(false);
  const iconComponent = showReviews ? <VisibilityOffIcon size='small' /> : <VisibilityIcon size='small' />;

  return (
    <div style={{ marginTop: "10px" }}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        className="reviewButton"
        startIcon={iconComponent}
        onClick = {()=> setShowReviews(!showReviews)}
      >
        Reviews
  </Button>
  <ShowReviews reviews = {reviews} showReviews= {showReviews}/>
    </div>)

  }
function App() {
  const [value, setValue] = useState(0);
  const [hasVoted, setVoted] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [username, setUsername] = useState(null);
  const [rating, setRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(null);
  const [review, setReview] = useState('');
  const[reviews,setReviews] = useState([]);

  console.log(review)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const url = JSON.stringify(tabs[0].url);
      const currentUser = url.split('/')[5];
      setUsername(currentUser);
      axios.get(getReviews + currentUser)
        .then((reviews) => {
          const reviewArray = reviews.data;
          setReviews(reviewArray)
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
      <Banner
        icon={<AccountCircleIcon />}
        label="OLX Reviews"
        open
        showDismissButton={false}
      />
      <Info message={"Username"} info={username} />
      <Info message={"Total de votos"} info={totalVotes} />
      <UserRating stars={rating} />
      <Message message={message} />
      <Rating
        name="hover-feedback"
        value={value}
        precision={1}
        onChange={(event, newValue) => {
          if (!hasVoted && review.length > 5) {
            setValue(newValue);
            const voteObject = { username, rating: newValue, review }
            setReview('');
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

          } else {
            setMessage(`Por favor escreve uma review.`);
            setTimeout(() => setMessage('Deixa a tua review!'), 2000);

          }
        }
        } />
      <TextField value={review} id="outlined-basic" label="Review" variant="outlined" multiline rowsMax={6} onChange={(event) => {
        if (event.target.value.length < 100) {
          setReview(event.target.value)
        }
      }
      } />
      <Reviews reviews={reviews} />

    </div>

  );
}

export default App;
