// Seats.tsx
import React, { useState } from 'react';
import './Seats.css';

type Seat = {
  id: number;
  reserved: boolean;
};

const Seats: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const savedSeats = localStorage.getItem('seats');
    return savedSeats ? JSON.parse(savedSeats) : Array.from({ length: 100 }, (_, i) => ({ id: i, reserved: false }));
  });

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const toggleReservation = (id: number) => {
    setSeats(prevSeats => {
      const updatedSeats = prevSeats.map(seat =>
        seat.id === id ? { ...seat, reserved: !seat.reserved } : seat
      );
      localStorage.setItem('seats', JSON.stringify(updatedSeats));
      return updatedSeats;
    });
  };

  return (
    <div className="screening-room-container">
      <h2 className="main-title">Select Your Seat</h2>
      <div className="legend">
        <div className="legend-item">
          <span className="box available"></span>Available
        </div>
        <div className="legend-item">
          <span className="box reserved"></span>Reserved
        </div>
      </div>
      <div className="seat-grid">
        {seats.map(seat => (
          <div
            key={seat.id}
            className={`box ${seat.reserved ? 'reserved' : 'available'}`}
            onClick={() => toggleReservation(seat.id)}
            onMouseEnter={() => setHoveredId(seat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {100 - seat.id}
            {hoveredId === seat.id && (
              <div className="tooltip">
                Seat {100 - seat.id}<br />
                {seat.reserved ? 'Reserved' : 'Available'}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="screen-indicator">Screen: Placeholder</div>
    </div>
  );
};

export default Seats;
