/* global chrome */
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Banner } from 'material-ui-banner';
import React, { useState, useEffect } from 'react';
import { TextField, Typography, Button, List, ListItem, Divider, ListItemText } from '@material-ui/core';
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
          position: 'relative', left: '66%', top: '12px',
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

const ShowReviews = ({ reviews, showReviews }) => {
  if (showReviews) {
    return (
      <div style={{ width: '350px' }}>
        <List>
          {reviews.map((e) => <><ListItem><ListItemText primaryTypographyProps={{ variant: "subtitle2", component: "subtitle2" }} primary={e.review + " - " + e.rating + "/5"} /></ListItem><Divider /></>)}
        </List>
      </div>
    )
  }
  return null;
}

const Reviews = ({ reviews, showReviews, setShowReviews }) => {
  const iconComponent = showReviews ? <VisibilityOffIcon size='small' /> : <VisibilityIcon size='small' />;

  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>

      <ShowReviews reviews={reviews} showReviews={showReviews} />
      <div style={{marginTop:"7px"}}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className="reviewButton"
          startIcon={iconComponent}
          onClick={() => setShowReviews(!showReviews)}
        >
          Reviews
  </Button>
      </div>
    </div>)

}

const WriteReview = (props) => {
  return (
    <div>
      <div>
        <br />
        <Info message={"Username"} info={props.username} />
        <Info message={"Total de votos"} info={props.totalVotes} />
        <UserRating stars={props.rating} />
        <Message message={props.message} />
        <Rating
          name="hover-feedback"
          value={props.value}
          precision={1}
          onChange={(event, newValue) => {
            if (!props.hasVoted && props.review.length > 5) {
              props.setValue(newValue);
              const voteObject = { username: props.username, rating: newValue, review: props.review }
              props.setReview('');
              axios
                .post(addReview, voteObject)
                .then(response => {
                  props.setVoted(true);
                  const newRating = ((props.rating * props.totalVotes) + newValue) / (props.totalVotes + 1)
                  props.setRating(newRating);
                  props.setTotalVotes(props.totalVotes + 1);
                  props.setMessage(`Votaste com ${newValue} estrelas!`);
                  setTimeout(() => props.setMessage('Obrigado por votares!'), 3000);
                }).catch(error => props.setMessage('Já votaste neste utilizador!'))

            } else {
              props.setMessage(`Por favor escreve uma review.`);
              setTimeout(() => props.setMessage('Deixa a tua review!'), 2000);

            }
          }
          } />
        <TextField value={props.review} id="outlined-basic" label="Review" variant="outlined" multiline rowsMax={6} onChange={(event) => {
          if (event.target.value.length < 100) {
            props.setReview(event.target.value)
          }
        }
        } />
      </div>
    </div>
  )
}


function App() {
  const [value, setValue] = useState(0);
  const [hasVoted, setVoted] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [username, setUsername] = useState(null);
  const [rating, setRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(null);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

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
  const wrProps = {
    username,
    totalVotes,
    rating,
    message,
    value,
    hasVoted,
    review,
    setValue,
    setReview,
    setRating,
    setVoted,
    setTotalVotes,
    setMessage
  }
  return (
    <div>
      <Banner
        icon={<AccountCircleIcon />}
        label="OLX Reviews"
        open
        showDismissButton={false}
      />
      {!showReviews && <WriteReview {...wrProps} />}
      <Reviews reviews={reviews} showReviews={showReviews} setShowReviews={setShowReviews} />
    </div>

  );
}

export default App;
