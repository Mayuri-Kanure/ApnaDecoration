/**
 * RESERVATION TIMER COMPONENT
 * Shows time remaining until reservation expires
 * Counts down from 10 minutes
 */

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

const ReservationTimer = ({ expiresAt, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        if (onExpire) onExpire();
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setTimeRemaining({
          minutes,
          seconds,
          totalSeconds: Math.floor(diff / 1000),
        });

        // Warning at 2 minutes
        setIsWarning(minutes < 2);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (isExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-600 mr-3" size={20} />
          <div>
            <p className="text-red-800 font-semibold">
              ⛔ Reservation Expired
            </p>
            <p className="text-red-700 text-sm">
              Your stock reservation has expired. Please start over.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  return (
    <div className={`p-4 mb-4 rounded-lg border-l-4 flex items-center ${
      isWarning
        ? "bg-red-50 border-red-500"
        : "bg-blue-50 border-blue-500"
    }`}>
      <Clock className={`mr-3 ${isWarning ? "text-red-600" : "text-blue-600"}`} size={20} />

      <div className="flex-1">
        <p className={`font-semibold ${
          isWarning ? "text-red-800" : "text-blue-800"
        }`}>
          {isWarning ? "🚨 Hurry! Stock Reserved" : "⏱️ Stock Reserved"}
        </p>
        <p className={`text-sm ${
          isWarning ? "text-red-700" : "text-blue-700"
        }`}>
          {`${timeRemaining.minutes}:${timeRemaining.seconds < 10 ? "0" : ""}${timeRemaining.seconds}`}{" "}
          remaining to complete payment
        </p>
      </div>

      {isWarning && (
        <div className="ml-4">
          <div className="flex items-center justify-center">
            <div className="text-red-600 text-xs font-bold animate-pulse">
              ⚠️ EXPIRING SOON
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTimer;
