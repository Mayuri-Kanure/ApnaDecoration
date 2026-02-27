import React from 'react';
import { useNavigate } from 'react-router-dom';
import Orders from './Orders';

function OrdersPending() {
  return <Orders status="pending" />;
}

export default OrdersPending;
