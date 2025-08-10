import React from 'react';
import { useParams } from 'react-router-dom';
import RateRequestForm from './RateRequestForm.js'

const RateRequestFormWrapper = () => {
  const { requestId } = useParams();
  const userId = sessionStorage.getItem('userId'); 

  return (
    <div>
      <RateRequestForm requestId={requestId} userId={userId} />
    </div>
  );
};

export default RateRequestFormWrapper;
