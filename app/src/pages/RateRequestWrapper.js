import React from 'react';
import { useParams } from 'react-router-dom';
import RateRequestForm from './RateRequestForm';

const RateRequestFormWrapper = () => {
  const { requestId } = useParams();
  const userId = sessionStorage.getItem('userId'); // Or your auth system

  return (
    <div>
      <h2>Rate a Finished Service</h2>
      <RateRequestForm requestId={requestId} userId={userId} />
    </div>
  );
};

export default RateRequestFormWrapper;
