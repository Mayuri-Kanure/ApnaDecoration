import React from "react";
import Orders from "./Orders";

function OrdersFailed() {
  return (
    <Orders status="cancelled" showCancelled={true} title="Cancelled Orders" />
  );
}

export default OrdersFailed;
