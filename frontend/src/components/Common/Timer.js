import React, { useState, useEffect, useRef } from 'react';

// Helper function to format time (MM:SS)
const formatTime = (timeInSeconds) => {
    if (timeInSeconds < 0) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function Timer({ durationMinutes, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const intervalRef = useRef(null); // To hold interval ID

    useEffect(() => {
        // Initialize timeLeft when durationMinutes changes
        setTimeLeft(durationMinutes * 60);
    }, [durationMinutes]);

    useEffect(() => {
        // Start timer only if timeLeft > 0
        if (timeLeft <= 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // Clear existing interval if time runs out
                intervalRef.current = null;
            }
            // Ensure onTimeUp is called only once when time reaches zero
            if (timeLeft === 0 && onTimeUp) {
                 console.log("Timer reached zero, calling onTimeUp.");
                 onTimeUp();
            }
            return; // Don't start a new interval if time is already zero or less
        }

        // Set up the interval
        intervalRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    clearInterval(intervalRef.current); // Clear interval when time hits 0
                    intervalRef.current = null;
                     // Call onTimeUp when the timer reaches exactly 0 during the interval update
                     if (onTimeUp) {
                        console.log("Timer hit zero during interval, calling onTimeUp.");
                        onTimeUp();
                    }
                    return 0; // Ensure timeLeft state is exactly 0
                }
                return newTime;
            });
        }, 1000);

        // Cleanup function to clear interval on component unmount or dependency change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                 console.log("Timer interval cleared on cleanup.");
            }
        };

        // Rerun effect if onTimeUp callback changes (though unlikely)
    }, [timeLeft, onTimeUp]); // Add timeLeft as dependency to handle pausing/resuming or dynamic changes


    return (
        <div className="timer font-bold text-lg text-red-600">
            Time Left: {formatTime(timeLeft)}
        </div>
    );
}

export default Timer;