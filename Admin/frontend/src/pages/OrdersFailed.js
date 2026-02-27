import React from 'react';
import Orders from './Orders';

function OrdersFailed() {
  return <Orders status="failed" showCancelled={true} title="Failed & Cancelled Orders" />;
}

export default OrdersFailed;
