import React, { useState, useEffect } from 'react';
import './Seats.css';
import type { ZaalProp } from "./../utils/fake-data";
import { useCurrentUserId } from '../context/UserContext';

type Seat = {
  id: number;
  reserved: boolean;
};

interface SeatsProps {
  zaal: ZaalProp;
  button: boolean;
  showId: string;
}

const Seats: React.FC<SeatsProps> = ({ zaal, button, showId }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const userId = useCurrentUserId();
  const [backendReserved, setBackendReserved] = useState<number[]>([]);

  useEffect(() => {
    const totalSeats = Math.max(zaal.rijen * zaal.stoelenPerRij, 0);
    const newSeats = Array.from({ length: totalSeats }, (_, i) => ({
      id: i,
      reserved: false,
    }));
    setSeats(newSeats);
  }, [zaal.rijen, zaal.stoelenPerRij]);

  useEffect(() => {
    const loadReservedSeats = async () => {
      try {
        const response = await fetch(`http://localhost:5275/api/Reservation/show/${showId}/seats`);
        if (response.ok) {
          const reservedNumbers: number[] = await response.json();
          setBackendReserved(reservedNumbers);
        }
      } catch (error) {
        console.error('Failed to load reserved seats:', error);
      }
    };

    if (showId) {
      loadReservedSeats();
    }
  }, [showId]);

const toggleReservation = (id: number) => {
  if (backendReserved.includes(id)) {
    alert("This seat is already reserved by someone else!");
    return;
  }

  setSeats(prevSeats =>
    prevSeats.map(seat =>
      seat.id === id ? { ...seat, reserved: !seat.reserved } : seat
    )
  );
};

  const handleReserve = async () => {
    const selectedSeats = seats.filter(s => s.reserved).map(s => s.id);
    
    if (selectedSeats.length === 0) {
      alert("Select at least one seat first!");
      return;
    }
    if (!userId) {
      alert("Please log in first!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5275/api/Reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          showId: showId,
          seatNumbers: selectedSeats
        }),
      });

      if (response.ok) {
        window.location.reload();
        alert("Reserved! 🎉");
        setSeats(seats.map(s => ({ ...s, reserved: false })));
      } else if (response.status === 409) {
        alert("Seats already reserved. 😞");
      } else {
        alert("Something went wrong.");
      }
    } catch {
      alert("Backend connection failed.");
    }
  };

return (
  <div className="screening-room-container">
    <h1 className="main-title">Select Your Seat</h1>
    
    <div className="legend">
      <div className="legend-item">
        <div className="box available"></div>
        Available
      </div>
      <div className="legend-item">
        <div className="box reserved"></div>
        Reserved
      </div>
    </div>

    <div className="seat-grid">
      {seats.map(seat => (
        <div
          key={seat.id}
          className={`box 
            ${
              backendReserved.includes(seat.id)
                ? 'backend-reserved'     //red - already taken
                : seat.reserved 
                  ? 'user-selected'      //gray - your selection
                  : 'available'           //blue - free
            }`
          }
          onClick={() => toggleReservation(seat.id)}
          onMouseEnter={() => setHoveredId(seat.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {zaal.rijen * zaal.stoelenPerRij - seat.id}
          {hoveredId === seat.id && (
            <div className="tooltip">
              Seat {zaal.rijen * zaal.stoelenPerRij - seat.id}
              {seat.reserved ? 'Reserved' : 'Available'}
            </div>
          )}
        </div>
      ))}
    </div>

    <div className="screen-indicator">SCREEN</div>

    {button && (
      <button className="button2" onClick={handleReserve}>Reserve</button>
    )}
  </div>
);

};

export default Seats;
