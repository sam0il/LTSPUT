import React, { useState } from 'react';
import axios from '../api/server_api';
import { useNavigate } from 'react-router-dom';  // Fix this import

const RateRequestForm = ({ requestId, userId, onRated }) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  const submitRating = async () => {
    try {
      await axios.post('/user/rate', {
        requestId,
        userId,
        stars,
        comment,
      });
      
      if (onRated) onRated();

      navigate('/');  // Redirect to homepage after submitting rating
    } catch (err) {
      console.error("Failed to submit rating:", err);
    }
  };

  return (
    <div>
      <h4>Rate this service</h4>
      <label>
        Stars (1-5):
        <input
          type="number"
          min="1"
          max="5"
          value={stars}
          onChange={(e) => setStars(e.target.value)}
        />
      </label>
      <br />
      <textarea
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <br />
      <button onClick={submitRating}>Submit Rating</button>
    </div>
  );
};

export default RateRequestForm;
